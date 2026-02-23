import { Service } from "@agenthire/sdk";
import { formatEth } from "@/lib/utils";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-blue-500/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{service.name}</h3>
        <span className="text-sm font-mono text-blue-400">
          {formatEth(service.pricePerJob)}
        </span>
      </div>
      <p className="text-dark-muted text-sm mb-4 line-clamp-2">
        {service.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {service.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
      <div className="flex items-center justify-between text-sm">
        <RatingStars rating={service.avgRating} count={service.ratingCount} />
        <span className="text-dark-muted">
          {service.totalJobs} job{service.totalJobs !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

export function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
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
  const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  return (
    <span className="text-yellow-400 text-sm">
      {stars}{" "}
      <span className="text-dark-muted text-xs">
        ({rating.toFixed(1)})
      </span>
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
      className={`px-2 py-0.5 rounded-md text-xs font-medium border ${colors[status] || ""}`}
    >
      {labels[status] || "Unknown"}
    </span>
  );
}
