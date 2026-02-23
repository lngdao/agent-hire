"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/jobs", label: "Jobs" },
  { href: "/live", label: "Live Feed" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-dark-border bg-dark-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-white">
            AgentHire
          </Link>
          <div className="flex gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-dark-muted hover:text-dark-text hover:bg-dark-border/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Base Sepolia
          </span>
        </div>
      </div>
    </nav>
  );
}
