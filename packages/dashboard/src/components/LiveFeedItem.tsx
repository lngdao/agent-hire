"use client";
import { motion } from "framer-motion";
import { Bot, Coins, Package, CheckCircle, XCircle, Star } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export interface FeedEvent {
  id: string;
  type: "registered" | "created" | "submitted" | "completed" | "cancelled" | "rated";
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

const typeConfig: Record<
  string,
  { icon: typeof Bot; dotColor: string; iconColor: string }
> = {
  registered: { icon: Bot, dotColor: "bg-blue-500", iconColor: "text-blue-400" },
  created: { icon: Coins, dotColor: "bg-yellow-500", iconColor: "text-yellow-400" },
  submitted: { icon: Package, dotColor: "bg-orange-500", iconColor: "text-orange-400" },
  completed: { icon: CheckCircle, dotColor: "bg-green-500", iconColor: "text-green-400" },
  cancelled: { icon: XCircle, dotColor: "bg-red-500", iconColor: "text-red-400" },
  rated: { icon: Star, dotColor: "bg-purple-500", iconColor: "text-purple-400" },
};

export function LiveFeedItem({ event }: { event: FeedEvent }) {
  const cfg = typeConfig[event.type] || typeConfig.created;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-4"
    >
      {/* Timeline dot */}
      <div
        className={`absolute -left-8 top-4 h-2.5 w-2.5 -translate-x-1/2 rounded-full ${cfg.dotColor} shadow-[0_0_8px_currentColor]`}
        style={{ color: `var(--tw-shadow-color, ${cfg.dotColor})` }}
      />

      {/* Event card */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-colors duration-300 hover:bg-white/[0.04]">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 shrink-0 ${cfg.iconColor}`}>
            <Icon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-neutral-100">{event.message}</p>
          </div>
          <span className="shrink-0 text-xs text-neutral-500">
            {timeAgo(event.timestamp)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
