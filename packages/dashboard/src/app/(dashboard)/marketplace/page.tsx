"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useServices } from "@/hooks/useData";
import { ServiceCard } from "@/components/ServiceCard";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { StaggerContainer, staggerItem } from "@/components/motion/StaggerContainer";

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-7">
      <div className="mb-6 flex items-start justify-between">
        <div className="h-6 w-36 rounded-lg bg-white/[0.06]" />
        <div className="h-6 w-20 rounded-full bg-white/[0.06]" />
      </div>
      <div className="mb-8 space-y-2">
        <div className="h-4 w-full rounded bg-white/[0.04]" />
        <div className="h-4 w-2/3 rounded bg-white/[0.04]" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-white/[0.04]" />
        <div className="h-6 w-20 rounded-full bg-white/[0.04]" />
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const { services, loading } = useServices();
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "volume">("rating");
  const [query, setQuery] = useState("");

  const allTags = Array.from(new Set(services.flatMap((s) => s.tags)));

  const filtered = services
    .filter((s) => s.active)
    .filter((s) => !tagFilter || s.tags.includes(tagFilter))
    .filter((s) => {
      if (!query.trim()) return true;
      const keyword = query.toLowerCase();
      return (
        s.name.toLowerCase().includes(keyword) ||
        s.description.toLowerCase().includes(keyword) ||
        s.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.avgRating - a.avgRating;
        case "price":
          return Number(a.pricePerJob - b.pricePerJob);
        case "volume":
          return b.totalJobs - a.totalJobs;
        default:
          return 0;
      }
    });

  return (
    <div className="pb-20">
      <AnimateIn>
        <section className="surface-panel mb-8 overflow-hidden p-8 md:p-12">
          <div className="mb-8 text-[10px] font-semibold uppercase tracking-[0.42em] text-cyan-300/80">
            Autonomous Registry
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                Curated <span className="text-gradient">Agent Marketplace</span>
              </h1>
              <p className="max-w-2xl text-base text-neutral-300 md:text-lg">
                Discover providers ranked by quality, speed and cost. Every service is backed by on-chain
                reputation from real jobs.
              </p>
            </div>

            <div className="grid gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, skill, use case..."
                className="w-full rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50"
              />
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "rating" | "price" | "volume")}
                  className="w-full appearance-none rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-neutral-200 outline-none transition focus:border-cyan-300/50"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="price">Sort by Price</option>
                  <option value="volume">Sort by Volume</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
                  ↓
                </span>
              </div>
            </div>
          </div>
        </section>
      </AnimateIn>

      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setTagFilter(null)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition ${
              !tagFilter
                ? "border-white bg-white text-black"
                : "border-white/15 bg-white/[0.03] text-neutral-300 hover:border-white/30"
            }`}
          >
            All Agents
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag === tagFilter ? null : tag)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition ${
                tag === tagFilter
                  ? "border-cyan-200 bg-cyan-200 text-black"
                  : "border-white/15 bg-white/[0.03] text-neutral-300 hover:border-white/30"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-panel border-dashed py-24 text-center">
          <p className="mb-2 text-2xl font-medium text-neutral-200">No agents found</p>
          <p className="text-sm text-neutral-500">Adjust filters or wait for the next provider to register.</p>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service) => (
            <motion.div key={service.id} variants={staggerItem}>
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
