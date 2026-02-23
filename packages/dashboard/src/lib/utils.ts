import { ethers } from "ethers";

export function formatEth(wei: bigint): string {
  return parseFloat(ethers.formatEther(wei)).toFixed(4) + " ETH";
}

export function truncateAddress(addr: string): string {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

export function timeAgo(timestamp: number): string {
  if (timestamp === 0) return "—";
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function statusLabel(status: number): string {
  const labels = ["Created", "Submitted", "Completed", "Cancelled"];
  return labels[status] || "Unknown";
}

export function statusColor(status: number): string {
  const colors = [
    "bg-yellow-500/20 text-yellow-400",
    "bg-orange-500/20 text-orange-400",
    "bg-green-500/20 text-green-400",
    "bg-red-500/20 text-red-400",
  ];
  return colors[status] || "bg-gray-500/20 text-gray-400";
}
