import { Job } from "@agenthire/sdk";
import { formatEth, truncateAddress, timeAgo } from "@/lib/utils";
import { StatusBadge, RatingStars } from "./ServiceCard";

const statusColors: Record<number, string> = {
  0: "bg-yellow-400",
  1: "bg-orange-400",
  2: "bg-green-400",
  3: "bg-red-400",
};

export function JobRow({ job }: { job: Job }) {
  return (
    <tr className="group relative border-b border-white/[0.06] transition-colors hover:bg-white/[0.03]">
      {/* Left accent bar */}
      <td className="relative px-4 py-3 font-mono text-sm text-neutral-500">
        <div
          className={`absolute left-0 top-1/2 h-0 w-[2px] -translate-y-1/2 transition-all duration-300 group-hover:h-8 ${statusColors[job.status] || "bg-white/20"}`}
        />
        #{job.id}
      </td>
      <td className="px-4 py-3 font-mono text-sm text-neutral-200">
        {truncateAddress(job.consumer)}
      </td>
      <td className="px-4 py-3 font-mono text-sm text-neutral-200">
        {truncateAddress(job.provider)}
      </td>
      <td className="max-w-[220px] truncate px-4 py-3 text-sm text-neutral-100">
        {job.taskDescription}
      </td>
      <td className="px-4 py-3 font-mono text-sm text-cyan-200">
        {formatEth(job.amount)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={job.status} />
      </td>
      <td className="px-4 py-3 text-sm">
        {job.rating > 0 ? (
          <RatingStars rating={job.rating} count={1} />
        ) : (
          <span className="text-neutral-500">&mdash;</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-neutral-500">
        {timeAgo(job.createdAt)}
      </td>
    </tr>
  );
}
