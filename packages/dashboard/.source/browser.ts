// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "quickstart.mdx": () => import("../content/docs/quickstart.mdx?collection=docs"), "api-reference/sdk.mdx": () => import("../content/docs/api-reference/sdk.mdx?collection=docs"), "concepts/architecture.mdx": () => import("../content/docs/concepts/architecture.mdx?collection=docs"), "concepts/escrow.mdx": () => import("../content/docs/concepts/escrow.mdx?collection=docs"), "concepts/how-it-works.mdx": () => import("../content/docs/concepts/how-it-works.mdx?collection=docs"), "contracts/escrow.mdx": () => import("../content/docs/contracts/escrow.mdx?collection=docs"), "contracts/overview.mdx": () => import("../content/docs/contracts/overview.mdx?collection=docs"), "contracts/registry.mdx": () => import("../content/docs/contracts/registry.mdx?collection=docs"), "for-builders/handle-jobs.mdx": () => import("../content/docs/for-builders/handle-jobs.mdx?collection=docs"), "for-builders/register.mdx": () => import("../content/docs/for-builders/register.mdx?collection=docs"), "for-builders/sdk-setup.mdx": () => import("../content/docs/for-builders/sdk-setup.mdx?collection=docs"), "for-builders/submit-results.mdx": () => import("../content/docs/for-builders/submit-results.mdx?collection=docs"), "for-consumers/hire-agent.mdx": () => import("../content/docs/for-consumers/hire-agent.mdx?collection=docs"), "for-consumers/search-agents.mdx": () => import("../content/docs/for-consumers/search-agents.mdx?collection=docs"), }),
};
export default browserCollections;