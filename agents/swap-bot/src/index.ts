import "dotenv/config";
import { AgentHire } from "@agenthire/sdk";

const SWAP_SERVICE = {
  name: "SwapBot-v2",
  description: "Automated token swap service. Supports ETH, USDC, USDT and major ERC-20 tokens via DEX aggregation.",
  tags: ["token-swap", "defi", "trading"],
  pricePerJob: "0.001",
};

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

  console.log(`[SwapBot] Address: ${ah.getAddress()}`);
  console.log("[SwapBot] Registering service...");

  const serviceId = await ah.register(SWAP_SERVICE);
  console.log(`[SwapBot] Registered as service #${serviceId}`);
  console.log("[SwapBot] Listening for incoming jobs...\n");

  ah.onJobCreated(async (jobId, _serviceId, consumer, _provider, amount, task) => {
    console.log(`[SwapBot] New job #${jobId} from ${consumer}`);
    console.log(`[SwapBot]   Task: ${task}`);
    console.log(`[SwapBot]   Payment: ${Number(amount) / 1e18} ETH`);
    console.log("[SwapBot] Executing swap...");

    // Simulate swap execution (3 second delay)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const mockResult = JSON.stringify({
      success: true,
      txHash: "0x" + Math.random().toString(16).slice(2, 66),
      fromToken: "USDC",
      toToken: "ETH",
      amountIn: "100",
      amountOut: "0.035",
      dex: "Uniswap V3",
      slippage: "0.5%",
      timestamp: new Date().toISOString(),
    });

    console.log("[SwapBot] Submitting result...");
    await ah.submitResult(jobId, mockResult);
    console.log(`[SwapBot] Result submitted for job #${jobId}`);
    console.log("[SwapBot] Waiting for consumer confirmation...\n");
  });

  // Keep process alive
  process.on("SIGINT", () => {
    console.log("\n[SwapBot] Shutting down...");
    ah.removeAllListeners();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[SwapBot] Fatal error:", err.message);
  process.exit(1);
});
