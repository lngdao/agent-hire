"use client";

const techs = [
  "Base",
  "Solidity",
  "Hardhat",
  "ethers.js",
  "Next.js",
  "TypeScript",
  "OpenAI",
  "Cursor",
  "Claude Code",
  "Windsurf",
  "OpenClaw",
  "MCP",
  "LangChain",
  "React",
];

export function TechLogos() {
  const doubled = [...techs, ...techs];

  return (
    <section className="overflow-hidden border-b border-white/[0.06] py-12">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "marquee 30s linear infinite" }}
      >
        {doubled.map((tech, i) => (
          <span
            key={`${tech}-${i}`}
            className="mx-8 inline-block font-mono text-sm font-medium text-neutral-600 transition-colors duration-300 hover:text-neutral-300 md:mx-12 md:text-base"
          >
            {tech}
          </span>
        ))}
      </div>
    </section>
  );
}
