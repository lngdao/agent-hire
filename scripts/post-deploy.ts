#!/usr/bin/env node

/**
 * Post-deploy: propagates contract addresses from deployments.json
 * to .env files in dashboard, swap-bot, and personal-assistant.
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const deploymentsPath = path.join(ROOT, "packages", "contracts", "deployments.json");

if (!fs.existsSync(deploymentsPath)) {
  console.error("deployments.json not found. Deploy contracts first.");
  process.exit(1);
}

const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
const { ServiceRegistry, JobEscrow } = deployments.contracts;

// Detect RPC URL based on network
const rpcUrl =
  deployments.network === "unknown" || deployments.network === "hardhat" || deployments.chainId === 31337
    ? "http://127.0.0.1:8545"
    : "https://sepolia.base.org";

console.log(`ServiceRegistry: ${ServiceRegistry}`);
console.log(`JobEscrow: ${JobEscrow}`);

function writeEnv(dir: string, vars: Record<string, string>) {
  const envPath = path.join(dir, ".env");
  let existing: Record<string, string> = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) existing[match[1].trim()] = match[2].trim();
    }
  }

  const merged = { ...existing, ...vars };
  const output = Object.entries(merged)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n") + "\n";

  fs.writeFileSync(envPath, output);
  console.log(`Updated ${envPath}`);
}

// Dashboard
writeEnv(path.join(ROOT, "packages", "dashboard"), {
  NEXT_PUBLIC_RPC_URL: rpcUrl,
  NEXT_PUBLIC_REGISTRY_ADDRESS: ServiceRegistry,
  NEXT_PUBLIC_ESCROW_ADDRESS: JobEscrow,
});

// SwapBot
writeEnv(path.join(ROOT, "agents", "swap-bot"), {
  RPC_URL: rpcUrl,
  REGISTRY_ADDRESS: ServiceRegistry,
  ESCROW_ADDRESS: JobEscrow,
});

// PersonalAssistant
writeEnv(path.join(ROOT, "agents", "personal-assistant"), {
  RPC_URL: rpcUrl,
  REGISTRY_ADDRESS: ServiceRegistry,
  ESCROW_ADDRESS: JobEscrow,
});

console.log("\nDone! Contract addresses propagated to all packages.");
