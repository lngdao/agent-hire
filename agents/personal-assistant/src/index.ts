import "dotenv/config";
import * as readline from "readline";
import OpenAI from "openai";
import { AgentHire } from "@agenthire/sdk";

async function main() {
  const { PRIVATE_KEY, RPC_URL, REGISTRY_ADDRESS, ESCROW_ADDRESS, OPENAI_API_KEY } = process.env;
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

  const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

  console.log(`[Assistant] Address: ${ah.getAddress()}`);
  console.log("[Assistant] Ready! Type a request or 'quit' to exit.\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question("You: ", async (input) => {
      const trimmed = input.trim();
      if (!trimmed || trimmed.toLowerCase() === "quit") {
        console.log("[Assistant] Goodbye!");
        rl.close();
        process.exit(0);
      }

      try {
        // Step 1: Classify the skill tag needed
        let tags: string[];
        if (openai) {
          console.log("[Assistant] Analyzing request with AI...");
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  'You are a skill classifier. Given a user request, return 1-3 relevant skill tags as a JSON array of strings. Available tags include: token-swap, defi, trading, research, translation, coding, analysis. Only respond with the JSON array, nothing else.',
              },
              { role: "user", content: trimmed },
            ],
            temperature: 0,
          });
          tags = JSON.parse(completion.choices[0].message.content || '["defi"]');
          console.log(`[Assistant] Identified skills: ${tags.join(", ")}`);
        } else {
          tags = ["token-swap", "defi"];
          console.log("[Assistant] No OpenAI key — using default tags: token-swap, defi");
        }

        // Step 2: Find matching services
        console.log("[Assistant] Searching marketplace...");
        const services = await ah.find({ tags });

        if (services.length === 0) {
          console.log("[Assistant] No agents found for this task. Try again later.\n");
          prompt();
          return;
        }

        const best = services[0];
        console.log(`[Assistant] Found: ${best.name} (Rating: ${best.avgRating.toFixed(1)}, Price: ${Number(best.pricePerJob) / 1e18} ETH)`);

        // Step 3: Hire the agent
        console.log(`[Assistant] Hiring ${best.name}...`);
        const jobId = await ah.hire(best.id, trimmed);
        console.log(`[Assistant] Job #${jobId} created. Waiting for result...`);

        // Step 4: Wait for result via event listener
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
          console.log("[Assistant] Job was cancelled.\n");
          prompt();
          return;
        }

        console.log(`[Assistant] Result received: ${job.result}`);

        // Step 5: Confirm and release payment
        console.log("[Assistant] Confirming completion...");
        await ah.confirmComplete(jobId);
        console.log("[Assistant] Payment released!");

        // Step 6: Rate the job
        let rating: number;
        if (openai) {
          const evalCompletion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are evaluating an AI agent's work result. Rate it 1-5 based on completeness and quality. Only respond with a single number.",
              },
              {
                role: "user",
                content: `Task: ${trimmed}\nResult: ${job.result}`,
              },
            ],
            temperature: 0,
          });
          rating = parseInt(evalCompletion.choices[0].message.content || "4");
          rating = Math.min(5, Math.max(1, rating));
        } else {
          rating = 5;
        }

        await ah.rate(jobId, rating);
        console.log(`[Assistant] Rated ${rating}/5 stars`);
        console.log("[Assistant] Task complete!\n");
      } catch (err: any) {
        console.error(`[Assistant] Error: ${err.message}\n`);
      }

      prompt();
    });
  };

  prompt();
}

main().catch((err) => {
  console.error("[Assistant] Fatal error:", err.message);
  process.exit(1);
});
