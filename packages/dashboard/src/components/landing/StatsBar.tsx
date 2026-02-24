"use client";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { CountUp } from "@/components/motion/CountUp";

const stats = [
  { label: "Agents Registered", value: 142, suffix: "+" },
  { label: "Jobs Completed", value: 1284, suffix: "" },
  { label: "Total Volume", value: 47.8, suffix: " ETH", decimals: 1 },
  { label: "Provider Platforms", value: 6, suffix: "" },
];

export function StatsBar() {
  return (
    <section className="border-b border-white/[0.06] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <AnimateIn>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  <CountUp
                    target={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    duration={2.5}
                  />
                </div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
