import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { ForceDarkDocsTheme } from "@/components/docs/ForceDarkDocsTheme";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{ title: "AgentHire" }}
    >
      <ForceDarkDocsTheme />
      {children}
    </DocsLayout>
  );
}
