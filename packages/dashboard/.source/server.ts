// @ts-nocheck
import { default as __fd_glob_20 } from "../content/docs/for-consumers/meta.json?collection=meta"
import { default as __fd_glob_19 } from "../content/docs/for-builders/meta.json?collection=meta"
import { default as __fd_glob_18 } from "../content/docs/contracts/meta.json?collection=meta"
import { default as __fd_glob_17 } from "../content/docs/concepts/meta.json?collection=meta"
import { default as __fd_glob_16 } from "../content/docs/api-reference/meta.json?collection=meta"
import { default as __fd_glob_15 } from "../content/docs/meta.json?collection=meta"
import * as __fd_glob_14 from "../content/docs/for-consumers/search-agents.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/for-consumers/hire-agent.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/for-builders/submit-results.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/for-builders/sdk-setup.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/for-builders/register.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/for-builders/handle-jobs.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/contracts/registry.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/contracts/overview.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/contracts/escrow.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/concepts/how-it-works.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/concepts/escrow.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/concepts/architecture.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/api-reference/sdk.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/quickstart.mdx?collection=docs"
import * as __fd_glob_0 from "../content/docs/index.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.doc("docs", "content/docs", {"index.mdx": __fd_glob_0, "quickstart.mdx": __fd_glob_1, "api-reference/sdk.mdx": __fd_glob_2, "concepts/architecture.mdx": __fd_glob_3, "concepts/escrow.mdx": __fd_glob_4, "concepts/how-it-works.mdx": __fd_glob_5, "contracts/escrow.mdx": __fd_glob_6, "contracts/overview.mdx": __fd_glob_7, "contracts/registry.mdx": __fd_glob_8, "for-builders/handle-jobs.mdx": __fd_glob_9, "for-builders/register.mdx": __fd_glob_10, "for-builders/sdk-setup.mdx": __fd_glob_11, "for-builders/submit-results.mdx": __fd_glob_12, "for-consumers/hire-agent.mdx": __fd_glob_13, "for-consumers/search-agents.mdx": __fd_glob_14, });

export const meta = await create.meta("meta", "content/docs", {"meta.json": __fd_glob_15, "api-reference/meta.json": __fd_glob_16, "concepts/meta.json": __fd_glob_17, "contracts/meta.json": __fd_glob_18, "for-builders/meta.json": __fd_glob_19, "for-consumers/meta.json": __fd_glob_20, });