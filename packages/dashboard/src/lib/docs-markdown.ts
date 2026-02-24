import { readFile } from "node:fs/promises";
import path from "node:path";

const DOCS_ROOT = path.join(process.cwd(), "content", "docs");

function hasUnsafeSegment(segments: string[]) {
  return segments.some((segment) => segment === ".." || segment.includes("/"));
}

export async function getMarkdownForSlug(slug?: string[]) {
  const normalized = slug ?? [];
  if (hasUnsafeSegment(normalized)) return null;

  const candidates =
    normalized.length === 0
      ? [path.join(DOCS_ROOT, "index.mdx")]
      : [
          path.join(DOCS_ROOT, `${normalized.join("/")}.mdx`),
          path.join(DOCS_ROOT, normalized.join("/"), "index.mdx"),
        ];

  for (const filePath of candidates) {
    try {
      return await readFile(filePath, "utf8");
    } catch {
      // Try the next candidate path.
    }
  }

  return null;
}
