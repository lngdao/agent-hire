import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX({
  mdxOptions: {
    rehypePlugins: [], // Fumadocs already handles this mostly, let's verify docs config
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@agenthire/sdk"],
};

export default withMDX(nextConfig);
