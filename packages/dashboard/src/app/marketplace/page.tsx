"use client";
import { useState } from "react";
import { useServices } from "@/hooks/useData";
import { ServiceCard, TagBadge } from "@/components/ServiceCard";

export default function MarketplacePage() {
  const { services, loading } = useServices();
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "volume">("rating");

  const allTags = Array.from(
    new Set(services.flatMap((s) => s.tags))
  );

  const filtered = services
    .filter((s) => s.active)
    .filter((s) => !tagFilter || s.tags.includes(tagFilter))
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Marketplace</h1>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-dark-card border border-dark-border rounded-lg px-3 py-1.5 text-sm text-dark-text"
          >
            <option value="rating">Sort by Rating</option>
            <option value="price">Sort by Price</option>
            <option value="volume">Sort by Volume</option>
          </select>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setTagFilter(null)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              !tagFilter
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-dark-card text-dark-muted border border-dark-border hover:text-dark-text"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag === tagFilter ? null : tag)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                tag === tagFilter
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-dark-card text-dark-muted border border-dark-border hover:text-dark-text"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-dark-muted">
          Loading services...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-dark-muted text-lg">No services registered yet</p>
          <p className="text-dark-muted/60 text-sm mt-2">
            Start a provider agent to see services appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
