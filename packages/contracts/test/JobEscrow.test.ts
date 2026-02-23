import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ServiceRegistry, JobEscrow } from "../typechain-types";

describe("JobEscrow", function () {
  let registry: ServiceRegistry;
  let escrow: JobEscrow;
  let deployer: any, provider: any, consumer: any, other: any;
  const PRICE = ethers.parseEther("0.001");

  beforeEach(async function () {
    [deployer, provider, consumer, other] = await ethers.getSigners();

    const RegistryFactory = await ethers.getContractFactory("ServiceRegistry");
    registry = await RegistryFactory.deploy();

    const EscrowFactory = await ethers.getContractFactory("JobEscrow");
    escrow = await EscrowFactory.deploy(await registry.getAddress());

    // Register a service
    await registry.connect(provider).registerService(
      "SwapBot",
      "Token swap service",
      ["token-swap", "defi"],
      PRICE
    );
  });

  describe("createJob", function () {
    it("should create a job with escrow", async function () {
      const tx = await escrow.connect(consumer).createJob(1, "Swap 100 USDC to ETH", { value: PRICE });
      await expect(tx).to.emit(escrow, "JobCreated");

      const j = await escrow.getJob(1);
      expect(j.consumer).to.equal(consumer.address);
      expect(j.provider).to.equal(provider.address);
      expect(j.amount).to.equal(PRICE);
      expect(j.status).to.equal(0); // Created
    });

    it("should reject insufficient payment", async function () {
      await expect(
        escrow.connect(consumer).createJob(1, "task", { value: ethers.parseEther("0.0001") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("should reject self-hire", async function () {
      await expect(
        escrow.connect(provider).createJob(1, "task", { value: PRICE })
      ).to.be.revertedWith("Cannot hire yourself");
    });

    it("should reject inactive service", async function () {
      await registry.connect(provider).deactivateService(1);
      await expect(
        escrow.connect(consumer).createJob(1, "task", { value: PRICE })
      ).to.be.revertedWith("Service not active");
    });
  });

  describe("submitResult", function () {
    beforeEach(async function () {
      await escrow.connect(consumer).createJob(1, "Swap 100 USDC to ETH", { value: PRICE });
    });

    it("should submit result", async function () {
      const tx = await escrow.connect(provider).submitResult(1, '{"txHash":"0xabc","amountOut":"0.035 ETH"}');
      await expect(tx).to.emit(escrow, "ResultSubmitted");

      const j = await escrow.getJob(1);
      expect(j.status).to.equal(1); // Submitted
    });

    it("should reject non-provider submission", async function () {
      await expect(
        escrow.connect(consumer).submitResult(1, "result")
      ).to.be.revertedWith("Not the provider");
    });
  });

  describe("confirmComplete", function () {
    beforeEach(async function () {
      await escrow.connect(consumer).createJob(1, "Swap 100 USDC to ETH", { value: PRICE });
      await escrow.connect(provider).submitResult(1, '{"txHash":"0xabc"}');
    });

    it("should complete and release payment", async function () {
      const providerBalBefore = await ethers.provider.getBalance(provider.address);
      const tx = await escrow.connect(consumer).confirmComplete(1);
      await expect(tx).to.emit(escrow, "JobCompleted").withArgs(1, PRICE);

      const j = await escrow.getJob(1);
      expect(j.status).to.equal(2); // Completed

      const providerBalAfter = await ethers.provider.getBalance(provider.address);
      expect(providerBalAfter - providerBalBefore).to.equal(PRICE);
    });

    it("should reject non-consumer confirmation", async function () {
      await expect(
        escrow.connect(provider).confirmComplete(1)
      ).to.be.revertedWith("Not the consumer");
    });
  });

  describe("rateJob", function () {
    beforeEach(async function () {
      await escrow.connect(consumer).createJob(1, "task", { value: PRICE });
      await escrow.connect(provider).submitResult(1, "result");
      await escrow.connect(consumer).confirmComplete(1);
    });

    it("should rate a completed job", async function () {
      const tx = await escrow.connect(consumer).rateJob(1, 5);
      await expect(tx).to.emit(escrow, "JobRated").withArgs(1, 5);

      const j = await escrow.getJob(1);
      expect(j.rating).to.equal(5);
    });

    it("should reject double rating", async function () {
      await escrow.connect(consumer).rateJob(1, 5);
      await expect(
        escrow.connect(consumer).rateJob(1, 4)
      ).to.be.revertedWith("Already rated");
    });

    it("should reject invalid rating", async function () {
      await expect(escrow.connect(consumer).rateJob(1, 0)).to.be.revertedWith("Rating must be 1-5");
      await expect(escrow.connect(consumer).rateJob(1, 6)).to.be.revertedWith("Rating must be 1-5");
    });

    it("should reject non-consumer rating", async function () {
      await expect(
        escrow.connect(provider).rateJob(1, 5)
      ).to.be.revertedWith("Not the consumer");
    });
  });

  describe("cancelJob", function () {
    beforeEach(async function () {
      await escrow.connect(consumer).createJob(1, "task", { value: PRICE });
    });

    it("should allow provider to cancel anytime", async function () {
      const consumerBalBefore = await ethers.provider.getBalance(consumer.address);
      const tx = await escrow.connect(provider).cancelJob(1);
      await expect(tx).to.emit(escrow, "JobCancelled");

      const j = await escrow.getJob(1);
      expect(j.status).to.equal(3); // Cancelled

      const consumerBalAfter = await ethers.provider.getBalance(consumer.address);
      expect(consumerBalAfter - consumerBalBefore).to.equal(PRICE);
    });

    it("should reject consumer cancel before timeout", async function () {
      await expect(
        escrow.connect(consumer).cancelJob(1)
      ).to.be.revertedWith("Must wait 1 hour to cancel");
    });

    it("should allow consumer cancel after timeout", async function () {
      await time.increase(3601); // 1 hour + 1 second
      await expect(escrow.connect(consumer).cancelJob(1)).to.emit(escrow, "JobCancelled");
    });

    it("should reject cancel from non-participant", async function () {
      await expect(
        escrow.connect(other).cancelJob(1)
      ).to.be.revertedWith("Not consumer or provider");
    });
  });

  describe("claimTimeout", function () {
    beforeEach(async function () {
      await escrow.connect(consumer).createJob(1, "task", { value: PRICE });
      await escrow.connect(provider).submitResult(1, "result");
    });

    it("should reject claim before 24h", async function () {
      await expect(
        escrow.connect(provider).claimTimeout(1)
      ).to.be.revertedWith("Must wait 24 hours to claim");
    });

    it("should allow provider claim after 24h", async function () {
      await time.increase(86401); // 24h + 1s
      const providerBalBefore = await ethers.provider.getBalance(provider.address);
      const tx = await escrow.connect(provider).claimTimeout(1);
      await expect(tx).to.emit(escrow, "JobCompleted");

      const j = await escrow.getJob(1);
      expect(j.status).to.equal(2); // Completed
    });

    it("should reject non-provider claim", async function () {
      await time.increase(86401);
      await expect(
        escrow.connect(consumer).claimTimeout(1)
      ).to.be.revertedWith("Not the provider");
    });
  });

  describe("full lifecycle", function () {
    it("should complete full hire → submit → confirm → rate flow", async function () {
      // Create job
      await escrow.connect(consumer).createJob(1, "Swap 100 USDC to ETH", { value: PRICE });

      // Submit result
      await escrow.connect(provider).submitResult(1, '{"txHash":"0xabc","amountOut":"0.035 ETH"}');

      // Confirm
      await escrow.connect(consumer).confirmComplete(1);

      // Rate
      await escrow.connect(consumer).rateJob(1, 5);

      // Verify final state
      const j = await escrow.getJob(1);
      expect(j.status).to.equal(2); // Completed
      expect(j.rating).to.equal(5);

      // Verify service stats updated
      const s = await registry.getService(1);
      expect(s.totalJobs).to.equal(1);
      expect(s.totalRating).to.equal(5);
      expect(s.ratingCount).to.equal(1);
    });
  });
});
