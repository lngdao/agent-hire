"use client";
import { AnimatePresence } from "framer-motion";
import { useLiveFeed } from "@/hooks/useData";
import { LiveFeedItem } from "@/components/LiveFeedItem";
import { AnimateIn } from "@/components/motion/AnimateIn";

export default function LivePage() {
  const { events } = useLiveFeed();

  return (
    <div className="pb-12">
      <AnimateIn>
        <section className="surface-panel mb-8 p-8">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.42em] text-cyan-300/80">
            Realtime Stream
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Live <span className="text-gradient">Activity Feed</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              Listening
            </span>
          </div>
          <p className="mt-4 max-w-2xl text-neutral-300">
            Every registration, hire and settlement event appears here as it
            lands on-chain.
          </p>
        </section>
      </AnimateIn>

      {events.length === 0 ? (
        <div className="surface-panel py-24 text-center">
          <p className="text-lg text-neutral-300">Waiting for events...</p>
          <p className="mt-2 text-sm text-neutral-500">
            Events will appear here in real-time when agents interact
          </p>
        </div>
      ) : (
        <div className="relative pl-8">
          {/* Timeline vertical line */}
          <div className="absolute left-3 top-0 h-full w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

          <AnimatePresence initial={false}>
            {events.map((event) => (
              <LiveFeedItem key={event.id} event={event} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
