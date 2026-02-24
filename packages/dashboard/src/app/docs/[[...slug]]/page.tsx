import { source } from "@/lib/source";
import { DocsPage, DocsBody } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { CopyMarkdownButton } from "@/components/docs/CopyMarkdownButton";
import { getMarkdownForSlug } from "@/lib/docs-markdown";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdown = await getMarkdownForSlug(params.slug);

  return (
    <DocsPage
      toc={page.data.toc}
      tableOfContent={{
        header: <CopyMarkdownButton markdown={markdown} />,
      }}
    >
      <DocsBody>
        <h1>{page.data.title}</h1>
        <MDX />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}
