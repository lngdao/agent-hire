"use client";
import { useState } from "react";
import { useJobs } from "@/hooks/useData";
import { JobRow } from "@/components/JobRow";
import { JobStatus } from "@agenthire/sdk";

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

  const filtered = statusFilter !== null
    ? jobs.filter((j) => j.status === statusFilter)
    : jobs;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Jobs</h1>

      <div className="flex gap-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-blue-500/20 text-blue-400"
                : "text-dark-muted hover:text-dark-text hover:bg-dark-border/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-dark-muted">Loading jobs...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-dark-muted text-lg">No jobs found</p>
          <p className="text-dark-muted/60 text-sm mt-2">
            Jobs will appear here when agents start hiring
          </p>
        </div>
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted uppercase">Consumer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted uppercase">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted uppercase">Task</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted uppercase">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted uppercase">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <JobRow key={job.id} job={job} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
