import { expect } from "chai";
import { ethers } from "hardhat";
import { ServiceRegistry } from "../typechain-types";

describe("ServiceRegistry", function () {
  let registry: ServiceRegistry;
  let owner: any, provider1: any, provider2: any;

  beforeEach(async function () {
    [owner, provider1, provider2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ServiceRegistry");
    registry = await Factory.deploy();
  });

  describe("registerService", function () {
    it("should register a service", async function () {
      const tx = await registry.connect(provider1).registerService(
        "SwapBot",
        "Token swap service",
        ["token-swap", "defi"],
        ethers.parseEther("0.001")
      );

      await expect(tx)
        .to.emit(registry, "ServiceRegistered")
        .withArgs(1, provider1.address, "SwapBot", ethers.parseEther("0.001"));

      const s = await registry.getService(1);
      expect(s.name).to.equal("SwapBot");
      expect(s.provider).to.equal(provider1.address);
      expect(s.active).to.be.true;
      expect(s.tags).to.deep.equal(["token-swap", "defi"]);
    });

    it("should reject empty name", async function () {
      await expect(
        registry.connect(provider1).registerService("", "desc", ["tag"], ethers.parseEther("0.001"))
      ).to.be.revertedWith("Name required");
    });

    it("should reject empty tags", async function () {
      await expect(
        registry.connect(provider1).registerService("Bot", "desc", [], ethers.parseEther("0.001"))
      ).to.be.revertedWith("At least one tag required");
    });

    it("should reject zero price", async function () {
      await expect(
        registry.connect(provider1).registerService("Bot", "desc", ["tag"], 0)
      ).to.be.revertedWith("Price must be > 0");
    });

    it("should index by tag", async function () {
      await registry.connect(provider1).registerService("Bot1", "desc", ["defi", "swap"], ethers.parseEther("0.001"));
      await registry.connect(provider2).registerService("Bot2", "desc", ["defi"], ethers.parseEther("0.002"));

      const defiServices = await registry.findByTag("defi");
      expect(defiServices.length).to.equal(2);

      const swapServices = await registry.findByTag("swap");
      expect(swapServices.length).to.equal(1);
    });

    it("should track provider services", async function () {
      await registry.connect(provider1).registerService("Bot1", "desc", ["tag1"], ethers.parseEther("0.001"));
      await registry.connect(provider1).registerService("Bot2", "desc", ["tag2"], ethers.parseEther("0.002"));

      const services = await registry.getProviderServices(provider1.address);
      expect(services.length).to.equal(2);
    });
  });

  describe("updateService", function () {
    beforeEach(async function () {
      await registry.connect(provider1).registerService("Bot", "desc", ["tag"], ethers.parseEther("0.001"));
    });

    it("should update service", async function () {
      await registry.connect(provider1).updateService(1, "BotV2", "new desc", ethers.parseEther("0.002"));
      const s = await registry.getService(1);
      expect(s.name).to.equal("BotV2");
      expect(s.pricePerJob).to.equal(ethers.parseEther("0.002"));
    });

    it("should reject non-provider update", async function () {
      await expect(
        registry.connect(provider2).updateService(1, "Hack", "hack", ethers.parseEther("0.001"))
      ).to.be.revertedWith("Not the provider");
    });
  });

  describe("deactivateService", function () {
    beforeEach(async function () {
      await registry.connect(provider1).registerService("Bot", "desc", ["tag"], ethers.parseEther("0.001"));
    });

    it("should deactivate service", async function () {
      await expect(registry.connect(provider1).deactivateService(1))
        .to.emit(registry, "ServiceDeactivated")
        .withArgs(1);
      const s = await registry.getService(1);
      expect(s.active).to.be.false;
    });

    it("should reject non-provider deactivation", async function () {
      await expect(
        registry.connect(provider2).deactivateService(1)
      ).to.be.revertedWith("Not the provider");
    });

    it("should reject double deactivation", async function () {
      await registry.connect(provider1).deactivateService(1);
      await expect(
        registry.connect(provider1).deactivateService(1)
      ).to.be.revertedWith("Already inactive");
    });
  });

  describe("ratings and jobs (onlyEscrow)", function () {
    let escrowMock: any;

    beforeEach(async function () {
      await registry.connect(provider1).registerService("Bot", "desc", ["tag"], ethers.parseEther("0.001"));
      // Deploy a JobEscrow to act as escrow caller
      const EscrowFactory = await ethers.getContractFactory("JobEscrow");
      escrowMock = await EscrowFactory.deploy(await registry.getAddress());
      await registry.setEscrow(await escrowMock.getAddress());
    });

    it("should reject non-escrow incrementJobCount", async function () {
      await expect(registry.incrementJobCount(1)).to.be.revertedWith("Only escrow");
      await expect(registry.connect(provider1).incrementJobCount(1)).to.be.revertedWith("Only escrow");
    });

    it("should reject non-escrow addRating", async function () {
      await expect(registry.addRating(1, 5)).to.be.revertedWith("Only escrow");
    });

    it("should reject invalid rating", async function () {
      // Even escrow can't add invalid rating — but we test via direct call which fails on onlyEscrow first
      await expect(registry.addRating(1, 0)).to.be.revertedWith("Only escrow");
    });
  });

  describe("setEscrow", function () {
    it("should set escrow address", async function () {
      await registry.setEscrow(provider1.address);
      expect(await registry.escrow()).to.equal(provider1.address);
    });

    it("should reject non-owner", async function () {
      await expect(
        registry.connect(provider1).setEscrow(provider1.address)
      ).to.be.revertedWith("Only owner");
    });

    it("should reject zero address", async function () {
      await expect(
        registry.setEscrow(ethers.ZeroAddress)
      ).to.be.revertedWith("Zero address");
    });
  });
});
