import "dotenv/config";
import * as readline from "readline";
import { AgentHire } from "@agenthire/sdk";

const TAG_OPTIONS = ["token-swap", "defi", "trading", "research", "translation", "coding", "analysis"];

async function main() {
  const { PRIVATE_KEY, RPC_URL, REGISTRY_ADDRESS, ESCROW_ADDRESS } = process.env;
  if (!PRIVATE_KEY || !RPC_URL || !REGISTRY_ADDRESS || !ESCROW_ADDRESS) {
    console.error("Missing environment variables. Check .env file.");
    process.exit(1);
  }

  const ah = new AgentHire({
    rpcUrl: RPC_URL,
    privateKey: PRIVATE_KEY,
    registryAddress: REGISTRY_ADDRESS,
    escrowAddress: ESCROW_ADDRESS,
  });

  console.log(`[Assistant-Simple] Address: ${ah.getAddress()}`);
  console.log("[Assistant-Simple] Simple mode — no OpenAI required.\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (q: string): Promise<string> =>
    new Promise((res) => rl.question(q, (a) => res(a.trim())));

  while (true) {
    console.log("Available tags:", TAG_OPTIONS.join(", "));
    const tagInput = await ask("Enter tag to search (or 'quit'): ");
    if (tagInput.toLowerCase() === "quit") break;

    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length === 0) {
      console.log("No tags specified.\n");
      continue;
    }

    console.log("[Assistant] Searching marketplace...");
    const services = await ah.find({ tags });

    if (services.length === 0) {
      console.log("[Assistant] No agents found.\n");
      continue;
    }

    console.log("\nAvailable agents:");
    services.forEach((s, i) => {
      console.log(
        `  ${i + 1}. ${s.name} — ${Number(s.pricePerJob) / 1e18} ETH — Rating: ${s.avgRating.toFixed(1)} (${s.ratingCount} reviews) — ${s.totalJobs} jobs`
      );
    });

    const choice = await ask("Select agent # (or 'skip'): ");
    if (choice.toLowerCase() === "skip") continue;

    const idx = parseInt(choice) - 1;
    if (idx < 0 || idx >= services.length) {
      console.log("Invalid selection.\n");
      continue;
    }

    const selected = services[idx];
    const task = await ask("Describe the task: ");
    if (!task) continue;

    console.log(`[Assistant] Hiring ${selected.name}...`);
    const jobId = await ah.hire(selected.id, task);
    console.log(`[Assistant] Job #${jobId} created. Waiting for result...`);

    const job = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        ah.escrow.removeAllListeners("ResultSubmitted");
        reject(new Error("Timeout waiting for result (5 min)"));
      }, 300000);

      ah.escrow.on("ResultSubmitted", async (id: bigint, _result: string) => {
        if (Number(id) === jobId) {
          clearTimeout(timeout);
          ah.escrow.removeAllListeners("ResultSubmitted");
          const j = await ah.getJob(jobId);
          resolve(j);
        }
      });
    });

    if (!job || job.status === 3) {
      console.log("[Assistant] Job cancelled.\n");
      continue;
    }

    console.log(`[Assistant] Result: ${job.result}`);
    console.log("[Assistant] Confirming completion...");
    await ah.confirmComplete(jobId);
    console.log("[Assistant] Payment released!");

    const ratingInput = await ask("Rate (1-5): ");
    const rating = Math.min(5, Math.max(1, parseInt(ratingInput) || 5));
    await ah.rate(jobId, rating);
    console.log(`[Assistant] Rated ${rating}/5\n`);
  }

  console.log("[Assistant] Goodbye!");
  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("[Assistant-Simple] Fatal error:", err.message);
  process.exit(1);
});
