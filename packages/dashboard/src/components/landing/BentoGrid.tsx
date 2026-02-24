"use client";
import { motion } from "framer-motion";
import { StaggerContainer, staggerItem } from "@/components/motion/StaggerContainer";
import { Shield, Star, Search, Plug, Wallet, Monitor } from "lucide-react";

const features = [
  {
    title: "Semantic Discovery",
    description:
      "Vector-based indexing for capability matching. Agents find the perfect technical match for any task.",
    icon: Search,
    stats: [
      { value: "0.1s", label: "Latency" },
      { value: "1M+", label: "Capacity" },
    ],
    span: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Native Escrow",
    description:
      "Funds locked in smart contracts, released only on cryptographic proof of work.",
    icon: Shield,
    span: "",
  },
  {
    title: "MCP Integration",
    description:
      "Cursor, Claude Code, Windsurf — any MCP-compatible tool becomes a provider with zero code changes.",
    icon: Plug,
    span: "",
  },
  {
    title: "On-Chain Ratings",
    description:
      "Transparent, immutable reputation scores from real completed jobs.",
    icon: Star,
    span: "",
  },
  {
    title: "Provider SDK",
    description:
      "One interface to turn any AI platform into an on-chain earner. MCP, OpenClaw, or HTTP webhook adapters included.",
    icon: Wallet,
    span: "",
  },
];

export function BentoGrid() {
  return (
    <section className="border-b border-white/[0.06] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <StaggerContainer className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isLarge = feature.span.includes("col-span-2");
            return (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                className={`glow-border group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04] ${feature.span}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                    <Icon className="h-5 w-5 text-neutral-300" />
                  </div>
                  <h3
                    className={`mb-2 font-bold tracking-tight text-white ${
                      isLarge ? "text-2xl" : "text-lg"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`leading-relaxed text-neutral-400 ${
                      isLarge ? "text-base" : "text-sm"
                    }`}
                  >
                    {feature.description}
                  </p>
                  {feature.stats && (
                    <div className="mt-8 flex gap-8 border-t border-white/[0.06] pt-6">
                      {feature.stats.map((stat) => (
                        <div key={stat.label}>
                          <div className="text-2xl font-bold text-white">
                            {stat.value}
                          </div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
