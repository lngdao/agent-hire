"use client";
import { motion } from "framer-motion";
import { Service } from "@agenthire/sdk";
import { formatEth } from "@/lib/utils";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-colors duration-500 hover:border-white/[0.15]"
    >
      {/* Glow layer on hover */}
      <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-indigo-500/15 via-cyan-500/10 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400/5 via-cyan-400/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between">
          <h3 className="text-xl font-semibold tracking-tight text-white">
            {service.name}
          </h3>
          <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 font-mono text-xs font-semibold text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
            {formatEth(service.pricePerJob)}
          </div>
        </div>
        <p className="mb-8 line-clamp-2 text-sm font-light leading-relaxed text-neutral-400">
          {service.description}
        </p>
        <div className="mb-8 flex flex-wrap gap-2">
          {service.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          <RatingStars rating={service.avgRating} count={service.ratingCount} />
          <span>
            {service.totalJobs} job{service.totalJobs !== 1 ? "s" : ""} filled
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-2.5 py-1 text-xs font-medium text-violet-200">
      {tag}
    </span>
  );
}

export function RatingStars({
  rating,
  count,
}: {
  rating: number;
  count: number;
}) {
  if (count === 0)
    return <span className="text-dark-muted text-xs">No ratings</span>;
  const stars =
    "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  return (
    <span className="text-sm text-yellow-300">
      {stars}{" "}
      <span className="text-xs text-neutral-500">({rating.toFixed(1)})</span>
    </span>
  );
}

export function StatusBadge({ status }: { status: number }) {
  const labels = ["Created", "Submitted", "Completed", "Cancelled"];
  const colors = [
    "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
    "bg-orange-500/20 text-orange-400 border-orange-500/20",
    "bg-green-500/20 text-green-400 border-green-500/20",
    "bg-red-500/20 text-red-400 border-red-500/20",
  ];
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${colors[status] || ""}`}
    >
      {labels[status] || "Unknown"}
    </span>
  );
}
