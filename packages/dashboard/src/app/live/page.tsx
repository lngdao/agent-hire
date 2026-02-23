"use client";
import { useLiveFeed } from "@/hooks/useData";
import { LiveFeedItem } from "@/components/LiveFeedItem";

export default function LivePage() {
  const { events } = useLiveFeed();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Live Feed</h1>
        <span className="inline-flex items-center gap-1.5 text-sm text-dark-muted">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Listening for events
        </span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-dark-muted text-lg">Waiting for events...</p>
          <p className="text-dark-muted/60 text-sm mt-2">
            Events will appear here in real-time when agents interact
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((event) => (
            <LiveFeedItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
