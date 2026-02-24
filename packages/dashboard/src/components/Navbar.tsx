"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Twitter, Menu, X, Disc as Discord } from "lucide-react";

const links = [
  { href: "/docs", label: "Docs" },
  { href: "/jobs", label: "Jobs" },
  { href: "/live", label: "Live" },
  { href: "/marketplace", label: "Marketplace" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="fixed left-0 right-0 top-4 z-[100] px-4">
        <div
          className={`mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-2xl border px-5 backdrop-blur-2xl transition-all duration-500 ${
            scrolled
              ? "border-white/[0.08] bg-black/80 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
              : "border-white/[0.06] bg-black/50 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          }`}
        >
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-3 transition-all duration-300 hover:opacity-80"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded bg-white transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                <div className="h-1.5 w-1.5 rounded-full bg-black" />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-white">
                AgentHire
              </span>
            </Link>

            <div className="relative flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] p-1 max-md:hidden">
              {links.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
                      isActive ? "text-black" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-neutral-400 max-lg:hidden">
              <Link
                href="https://twitter.com"
                target="_blank"
                className="transition-colors hover:text-white"
              >
                <Twitter size={18} />
              </Link>
              <Link
                href="https://discord.com"
                target="_blank"
                className="transition-colors hover:text-white"
              >
                <Discord size={18} />
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                className="transition-colors hover:text-white"
              >
                <Github size={18} />
              </Link>
              <div className="mx-2 h-4 w-px bg-white/10" />
            </div>

            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-black transition-all duration-300 hover:bg-neutral-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] max-md:hidden"
            >
              Launch App
            </Link>

            <button
              className="p-2 text-white md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-[201] h-full w-[300px] border-l border-white/[0.06] bg-black/90 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
                <span className="text-[15px] font-bold text-white">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 text-neutral-400 transition-colors hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-1 p-4">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      className={`block rounded-xl px-4 py-3 text-[15px] font-medium transition-colors ${
                        pathname.startsWith(link.href)
                          ? "bg-white/10 text-white"
                          : "text-neutral-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-4"
                >
                  <Link
                    href="/marketplace"
                    className="block rounded-xl bg-white px-4 py-3 text-center text-[15px] font-semibold text-black transition-colors hover:bg-neutral-200"
                  >
                    Launch App
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
