#!/usr/bin/env node

/**
 * E2E Test: Deploys contracts to local Hardhat node and runs full lifecycle.
 * Usage: npx hardhat node (in another terminal), then: npx ts-node scripts/e2e-test.ts
 */

import { ethers } from "ethers";
import { AgentHire } from "@agenthire/sdk";

const RPC_URL = "http://127.0.0.1:8545";

// Hardhat default accounts
const DEPLOYER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const PROVIDER_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const CONSUMER_KEY = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";

async function main() {
  console.log("=== AgentHire E2E Test ===\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const deployer = new ethers.Wallet(DEPLOYER_KEY, provider);

  // Deploy contracts
  console.log("1. Deploying contracts...");
  const registryFactory = new ethers.ContractFactory(
    (await import("../packages/contracts/artifacts/contracts/ServiceRegistry.sol/ServiceRegistry.json")).abi,
    (await import("../packages/contracts/artifacts/contracts/ServiceRegistry.sol/ServiceRegistry.json")).bytecode,
    deployer
  );
  const registry = await registryFactory.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log(`   ServiceRegistry: ${registryAddr}`);

  const escrowFactory = new ethers.ContractFactory(
    (await import("../packages/contracts/artifacts/contracts/JobEscrow.sol/JobEscrow.json")).abi,
    (await import("../packages/contracts/artifacts/contracts/JobEscrow.sol/JobEscrow.json")).bytecode,
    deployer
  );
  const escrow = await escrowFactory.deploy(registryAddr);
  await escrow.waitForDeployment();
  const escrowAddr = await escrow.getAddress();
  console.log(`   JobEscrow: ${escrowAddr}`);

  // Create SDK instances
  const providerSDK = new AgentHire({
    rpcUrl: RPC_URL,
    privateKey: PROVIDER_KEY,
    registryAddress: registryAddr,
    escrowAddress: escrowAddr,
  });

  const consumerSDK = new AgentHire({
    rpcUrl: RPC_URL,
    privateKey: CONSUMER_KEY,
    registryAddress: registryAddr,
    escrowAddress: escrowAddr,
  });

  // Register service
  console.log("\n2. Registering service...");
  const serviceId = await providerSDK.register({
    name: "TestBot",
    description: "E2E test service",
    tags: ["test", "e2e"],
    pricePerJob: "0.001",
  });
  console.log(`   Registered service #${serviceId}`);

  // Find service
  console.log("\n3. Finding services...");
  const services = await consumerSDK.find({ tags: ["test"] });
  console.log(`   Found ${services.length} service(s): ${services.map((s) => s.name).join(", ")}`);
  assert(services.length === 1, "Expected 1 service");
  assert(services[0].name === "TestBot", "Expected TestBot");

  // Hire
  console.log("\n4. Hiring agent...");
  const jobId = await consumerSDK.hire(serviceId, "Run E2E test task");
  console.log(`   Job #${jobId} created`);

  // Submit result
  console.log("\n5. Submitting result...");
  await providerSDK.submitResult(jobId, '{"status":"ok","result":"E2E test passed"}');
  console.log("   Result submitted");

  // Confirm
  console.log("\n6. Confirming completion...");
  await consumerSDK.confirmComplete(jobId);
  console.log("   Payment released");

  // Rate
  console.log("\n7. Rating job...");
  await consumerSDK.rate(jobId, 5);
  console.log("   Rated 5/5");

  // Verify final state
  console.log("\n8. Verifying state...");
  const job = await consumerSDK.getJob(jobId);
  assert(job !== null, "Job should exist");
  assert(job!.status === 2, `Expected Completed(2), got ${job!.status}`);
  assert(job!.rating === 5, `Expected rating 5, got ${job!.rating}`);

  const service = await consumerSDK.getService(serviceId);
  assert(service !== null, "Service should exist");
  assert(service!.totalJobs === 1, `Expected 1 job, got ${service!.totalJobs}`);
  assert(service!.ratingCount === 1, `Expected 1 rating, got ${service!.ratingCount}`);
  console.log("   All assertions passed!");

  console.log("\n=== E2E Test PASSED ===");
  process.exit(0);
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("E2E Test FAILED:", err);
  process.exit(1);
});
