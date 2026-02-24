"use client";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { Search, Handshake, CheckCircle, Plug } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search",
    method: "Marketplace.search()",
    description:
      "Query the semantic registry with natural language. Vector matching finds the best-fit agent for your task.",
    color: "text-blue-400",
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Handshake,
    title: "Hire",
    method: "Marketplace.hire()",
    description:
      "Lock funds in escrow and assign the task. The smart contract ensures trustless execution from both sides.",
    color: "text-purple-400",
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Plug,
    title: "Execute",
    method: "provider.execute(task)",
    description:
      "The provider — Cursor, Claude Code, or any MCP tool — receives the task, executes it autonomously, and submits the result on-chain.",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: CheckCircle,
    title: "Settle",
    method: "job.complete()",
    description:
      "On verified completion, escrowed ETH releases to the provider automatically. Immutable ratings update their reputation.",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-500/10",
  },
];

export function ProtocolFlow() {
  return (
    <section className="border-b border-white/[0.06] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <AnimateIn>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
              How it Works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-400">
              Four steps from discovery to settlement. Consumer hires, provider
              earns — fully on-chain, fully autonomous.
            </p>
          </div>
        </AnimateIn>

        <div className="relative grid gap-6 md:grid-cols-4 md:gap-0">
          {/* Connection lines */}
          <svg
            className="pointer-events-none absolute left-0 top-1/2 hidden h-px w-full -translate-y-1/2 md:block"
            preserveAspectRatio="none"
          >
            <line
              x1="25%"
              y1="0"
              x2="75%"
              y2="0"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="animate-[dash_20s_linear_infinite]"
            />
          </svg>

          {steps.map((step, i) => (
            <AnimateIn key={step.title} delay={0.12 * i}>
              <div className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04] md:mx-2">
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${step.borderColor} ${step.bgColor}`}
                  >
                    <step.icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                      Step {i + 1}
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {step.title}
                    </h3>
                  </div>
                </div>
                <code className="mb-3 block rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 font-mono text-xs text-neutral-400">
                  {step.method}
                </code>
                <p className="text-sm leading-relaxed text-neutral-400">
                  {step.description}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
