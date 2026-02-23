import { Job } from "@agenthire/sdk";
import { formatEth, truncateAddress, timeAgo } from "@/lib/utils";
import { StatusBadge, RatingStars } from "./ServiceCard";

export function JobRow({ job }: { job: Job }) {
  return (
    <tr className="border-b border-dark-border hover:bg-dark-card/50 transition-colors">
      <td className="px-4 py-3 text-sm font-mono text-dark-muted">#{job.id}</td>
      <td className="px-4 py-3 text-sm font-mono">{truncateAddress(job.consumer)}</td>
      <td className="px-4 py-3 text-sm font-mono">{truncateAddress(job.provider)}</td>
      <td className="px-4 py-3 text-sm text-dark-text max-w-[200px] truncate">
        {job.taskDescription}
      </td>
      <td className="px-4 py-3 text-sm text-blue-400 font-mono">{formatEth(job.amount)}</td>
      <td className="px-4 py-3">
        <StatusBadge status={job.status} />
      </td>
      <td className="px-4 py-3 text-sm">
        {job.rating > 0 ? (
          <RatingStars rating={job.rating} count={1} />
        ) : (
          <span className="text-dark-muted">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-dark-muted">{timeAgo(job.createdAt)}</td>
    </tr>
  );
}
