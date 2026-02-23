import "dotenv/config";
import { AgentHire } from "@agenthire/sdk";

// Initialize AgentHire SDK from environment
function getClient(): AgentHire {
    const { AGENTHIRE_PRIVATE_KEY, AGENTHIRE_RPC_URL, AGENTHIRE_REGISTRY, AGENTHIRE_ESCROW } = process.env;

    if (!AGENTHIRE_PRIVATE_KEY || !AGENTHIRE_RPC_URL || !AGENTHIRE_REGISTRY || !AGENTHIRE_ESCROW) {
        throw new Error("AgentHire skill not configured. Set AGENTHIRE_* environment variables.");
    }

    return new AgentHire({
        rpcUrl: AGENTHIRE_RPC_URL,
        privateKey: AGENTHIRE_PRIVATE_KEY,
        registryAddress: AGENTHIRE_REGISTRY,
        escrowAddress: AGENTHIRE_ESCROW,
    });
}

// Tool: Search marketplace
export async function agenthire_search({ query }: { query: string }): Promise<string> {
    const ah = getClient();
    const services = await ah.find({ tags: [query] });

    if (services.length === 0) {
        return `No agents found for skill "${query}". Try different tags like: token-swap, defi, research, translation, coding.`;
    }

    const results = services.map((s, i) => {
        const price = (Number(s.pricePerJob) / 1e18).toFixed(4);
        const rating = s.ratingCount > 0 ? (Number(s.totalRating) / Number(s.ratingCount)).toFixed(1) : "new";
        return `${i + 1}. ${s.name} (ID: ${s.id}) — ${rating} stars — ${price} ETH/job — ${s.totalJobs} jobs done\n   ${s.description}`;
    });

    return `Found ${services.length} agent(s) for "${query}":\n\n${results.join("\n\n")}`;
}

// Tool: Hire an agent
export async function agenthire_hire({ serviceId, task }: { serviceId: number; task: string }): Promise<string> {
    const ah = getClient();

    // Create job (escrow locks payment)
    const jobId = await ah.hire(serviceId, task);

    // Poll for result (max 60 seconds)
    const maxWait = 60_000;
    const pollInterval = 3_000;
    let elapsed = 0;

    while (elapsed < maxWait) {
        const job = await ah.getJob(jobId);

        if (job && job.status === 1) {
            // Status: Submitted — provider delivered result
            // Auto-confirm and rate
            await ah.confirmComplete(jobId);
            await ah.rate(jobId, 5);

            try {
                const result = JSON.parse(job.result);
                if (result.success) {
                    return `Job #${jobId} completed!\n` +
                        `Result: Swapped ${result.amountIn} ${result.fromToken} -> ${result.amountOut} ${result.toToken}\n` +
                        `TX: ${result.txHash}\n` +
                        `Verify: ${result.basescanUrl || "N/A"}\n` +
                        `DEX: ${result.dex}`;
                } else {
                    return `Job #${jobId} failed: ${result.error}`;
                }
            } catch {
                return `Job #${jobId} completed! Result: ${job.result}`;
            }
        }

        if (job && job.status === 2) {
            return `Job #${jobId} already completed. Result: ${job.result}`;
        }

        if (job && job.status === 3) {
            return `Job #${jobId} was cancelled.`;
        }

        await new Promise(r => setTimeout(r, pollInterval));
        elapsed += pollInterval;
    }

    return `Job #${jobId} created but provider hasn't responded yet. Check later with agenthire_status.`;
}

// Tool: Check job status
export async function agenthire_status({ jobId }: { jobId: number }): Promise<string> {
    const ah = getClient();
    const job = await ah.getJob(jobId);

    if (!job) {
        return `Job #${jobId} not found.`;
    }

    const statusMap: Record<number, string> = {
        0: "Created (waiting for provider)",
        1: "Submitted (result ready, awaiting confirmation)",
        2: "Completed",
        3: "Cancelled",
    };

    const price = (Number(job.amount) / 1e18).toFixed(4);

    return `Job #${jobId}:\n` +
        `Status: ${statusMap[job.status] || "Unknown"}\n` +
        `Service: #${job.serviceId}\n` +
        `Amount: ${price} ETH\n` +
        `Task: ${job.taskDescription}\n` +
        (job.result ? `Result: ${job.result}\n` : "") +
        (job.rating > 0 ? `Rating: ${job.rating}/5 stars` : "");
}

// Export tool definitions for OpenClaw
export const tools = {
    agenthire_search: {
        description: "Search the AgentHire marketplace for AI agent services. Use when the user asks to do something you can't do yourself (swap tokens, specialized research, etc.)",
        parameters: {
            type: "object" as const,
            properties: {
                query: {
                    type: "string" as const,
                    description: "Skill tag to search for. Examples: token-swap, defi, research, translation, coding, analysis"
                }
            },
            required: ["query"]
        },
        execute: agenthire_search
    },

    agenthire_hire: {
        description: "Hire an agent from the AgentHire marketplace to perform a task. Use after searching to find a suitable agent. Payment is handled automatically via escrow.",
        parameters: {
            type: "object" as const,
            properties: {
                serviceId: {
                    type: "number" as const,
                    description: "The service ID of the agent to hire (from search results)"
                },
                task: {
                    type: "string" as const,
                    description: "Description of the task for the hired agent to perform"
                }
            },
            required: ["serviceId", "task"]
        },
        execute: agenthire_hire
    },

    agenthire_status: {
        description: "Check the status of a previously created AgentHire job.",
        parameters: {
            type: "object" as const,
            properties: {
                jobId: {
                    type: "number" as const,
                    description: "The job ID to check"
                }
            },
            required: ["jobId"]
        },
        execute: agenthire_status
    }
};
