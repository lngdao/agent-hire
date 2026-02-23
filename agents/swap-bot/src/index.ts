import "dotenv/config";
import { ethers } from "ethers";
import { AgentHire } from "@agenthire/sdk";

// SimpleDEX ABI (only what we need)
const DEX_ABI = [
    "function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut)",
    "event Swapped(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, uint256 timestamp)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)"
];

const SWAP_SERVICE = {
    name: "SwapBot-v2",
    description: "Real on-chain token swap service on Base Sepolia via SimpleDEX.",
    tags: ["token-swap", "defi", "trading"],
    pricePerJob: "0.001",
};

async function main() {
    const {
        PRIVATE_KEY, RPC_URL, REGISTRY_ADDRESS, ESCROW_ADDRESS,
        DEX_ADDRESS, USDC_ADDRESS, WETH_ADDRESS
    } = process.env;

    if (!PRIVATE_KEY || !RPC_URL || !REGISTRY_ADDRESS || !ESCROW_ADDRESS || !DEX_ADDRESS) {
        console.error("Missing environment variables. Check .env file.");
        process.exit(1);
    }

    const ah = new AgentHire({
        rpcUrl: RPC_URL,
        privateKey: PRIVATE_KEY,
        registryAddress: REGISTRY_ADDRESS,
        escrowAddress: ESCROW_ADDRESS,
    });

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, wallet);
    const usdc = new ethers.Contract(USDC_ADDRESS!, ERC20_ABI, wallet);

    console.log(`[SwapBot] Address: ${ah.getAddress()}`);
    console.log("[SwapBot] Registering service...");

    const serviceId = await ah.register(SWAP_SERVICE);
    console.log(`[SwapBot] Registered as service #${serviceId}`);
    console.log("[SwapBot] Listening for incoming jobs...\n");

    ah.onJobCreated(async (jobId, _serviceId, consumer, _provider, amount, task) => {
        console.log(`[SwapBot] New job #${jobId} from ${consumer}`);
        console.log(`[SwapBot]   Task: ${task}`);
        console.log(`[SwapBot]   Payment: ${Number(amount) / 1e18} ETH`);

        try {
            // Parse swap amount from task (e.g., "Swap 100 USDC to ETH")
            const match = task.match(/(\d+)\s*USDC/i);
            const swapAmount = match ? match[1] : "100";
            const amountIn = ethers.parseUnits(swapAmount, 6); // USDC has 6 decimals

            // Check SwapBot USDC balance
            const balance = await usdc.balanceOf(wallet.address);
            console.log(`[SwapBot] USDC Balance: ${ethers.formatUnits(balance, 6)}`);

            // Approve DEX to spend USDC (explicit nonce for Hardhat automining)
            console.log("[SwapBot] Approving DEX...");
            let nonce = await wallet.getNonce();
            const approveTx = await usdc.approve(DEX_ADDRESS, amountIn, { nonce });
            await approveTx.wait();
            console.log(`[SwapBot] Approved. TX: ${approveTx.hash}`);

            // Small delay to let nonce settle on Hardhat automining
            await new Promise(r => setTimeout(r, 1000));

            // Execute swap (fresh nonce)
            console.log("[SwapBot] Executing swap on SimpleDEX...");
            nonce = await wallet.getNonce();
            const swapTx = await dex.swap(USDC_ADDRESS, amountIn, { nonce });
            const receipt = await swapTx.wait();
            console.log(`[SwapBot] Swap executed! TX: ${swapTx.hash}`);

            // Delay before submitResult
            await new Promise(r => setTimeout(r, 1000));

            // Parse Swapped event for amountOut
            const swapEvent = receipt.logs.find((log: any) => {
                try {
                    return dex.interface.parseLog(log)?.name === "Swapped";
                } catch { return false; }
            });

            let amountOut = "0";
            if (swapEvent) {
                const parsed = dex.interface.parseLog(swapEvent);
                amountOut = ethers.formatUnits(parsed!.args.amountOut, 18);
            }

            // Submit real result
            const result = JSON.stringify({
                success: true,
                txHash: swapTx.hash,
                blockNumber: receipt.blockNumber,
                fromToken: "USDC",
                toToken: "WETH",
                amountIn: swapAmount,
                amountOut: amountOut,
                dex: "SimpleDEX (Base Sepolia)",
                basescanUrl: `https://sepolia.basescan.org/tx/${swapTx.hash}`,
                timestamp: new Date().toISOString(),
            });

            console.log("[SwapBot] Submitting result...");
            // Wait a tick for nonce to settle
            await new Promise(r => setTimeout(r, 500));
            await ah.submitResult(jobId, result);
            console.log(`[SwapBot] Result submitted for job #${jobId}`);
            console.log(`[SwapBot] BaseScan: https://sepolia.basescan.org/tx/${swapTx.hash}`);
            console.log("[SwapBot] Waiting for consumer confirmation...\n");

        } catch (err: any) {
            console.error(`[SwapBot] Swap failed: ${err.message}`);
            // Submit error result so consumer can cancel
            await ah.submitResult(jobId, JSON.stringify({
                success: false,
                error: err.message,
                timestamp: new Date().toISOString(),
            }));
        }
    });

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
