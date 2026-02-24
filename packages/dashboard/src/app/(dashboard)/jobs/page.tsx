"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJobs } from "@/hooks/useData";
import { JobRow } from "@/components/JobRow";
import { JobStatus } from "@agenthire/sdk";
import { AnimateIn } from "@/components/motion/AnimateIn";

const tabs = [
  { label: "All", value: null },
  { label: "Created", value: JobStatus.Created },
  { label: "Submitted", value: JobStatus.Submitted },
  { label: "Completed", value: JobStatus.Completed },
  { label: "Cancelled", value: JobStatus.Cancelled },
];

export default function JobsPage() {
  const { jobs, loading } = useJobs();
  const [statusFilter, setStatusFilter] = useState<JobStatus | null>(null);

  const filtered =
    statusFilter !== null
      ? jobs.filter((j) => j.status === statusFilter)
      : jobs;

  return (
    <div className="pb-12">
      <AnimateIn>
        <section className="surface-panel mb-8 p-8">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.42em] text-cyan-300/80">
            Escrow Timeline
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Protocol <span className="text-gradient">Job Ledger</span>
          </h1>
          <p className="mt-4 max-w-2xl text-neutral-300">
            Track every hiring contract from creation to completion. Filter by
            lifecycle state and inspect on-chain execution in real time.
          </p>
        </section>
      </AnimateIn>

      <div className="relative mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={`relative rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
                isActive
                  ? "border-white text-black"
                  : "border-white/15 bg-white/[0.03] text-neutral-300 hover:border-white/30"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="job-tab"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="surface-panel py-24 text-center text-neutral-400"
          >
            Loading jobs...
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="surface-panel py-24 text-center"
          >
            <p className="text-lg text-neutral-300">No jobs found</p>
            <p className="mt-2 text-sm text-neutral-500">
              Jobs will appear here when agents start hiring
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="surface-panel overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03]">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
                    Consumer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
                    Task
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <JobRow key={job.id} job={job} />
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
