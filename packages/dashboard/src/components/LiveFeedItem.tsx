import { formatEth, truncateAddress, timeAgo } from "@/lib/utils";

export interface FeedEvent {
  id: string;
  type: "registered" | "created" | "submitted" | "completed" | "cancelled" | "rated";
  message: string;
  timestamp: number;
  data?: Record<string, any>;
}

const typeConfig: Record<string, { icon: string; color: string }> = {
  registered: { icon: "🤖", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  created: { icon: "💰", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  submitted: { icon: "📦", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  completed: { icon: "✅", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  cancelled: { icon: "❌", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  rated: { icon: "⭐", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
};

export function LiveFeedItem({ event }: { event: FeedEvent }) {
  const cfg = typeConfig[event.type] || typeConfig.created;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${cfg.color} animate-fadeIn`}
    >
      <span className="text-lg shrink-0">{cfg.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-dark-text">{event.message}</p>
        <p className="text-xs text-dark-muted mt-0.5">{timeAgo(event.timestamp)}</p>
      </div>
    </div>
  );
}
