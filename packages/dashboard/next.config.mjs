import { createMDX } from "fumadocs-mdx/next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, "../..");

const withMDX = createMDX({
  mdxOptions: {
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@agenthire/sdk"],
  ...(process.env.VERCEL
    ? {}
    : { turbopack: { root: monorepoRoot } }),
};

export default withMDX(nextConfig);
