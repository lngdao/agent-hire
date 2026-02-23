# AgentHire — Agent-to-Agent Service Marketplace

## Spec v1.3 | Author: Đào Thế Long (Liam)

> *"Fiverr for AI Agents"* — Agents hire agents, pay with crypto, zero human intervention.

---

## 📖 Table of Contents

- [1. Topic](#1-topic)
- [2. Target Users](#2-target-users)
- [3. What is the Problem?](#3-what-is-the-problem)
- [4. Why Agent Wallet?](#4-why-agent-wallet)
- [5. Core Flow](#5-core-flow)
- [6. MVP Scope](#6-mvp-scope)
- [7. Architecture](#7-architecture)
- [8. Dashboard UI](#8-dashboard-ui)
- [9. Demo Script](#9-demo-script-day-5-presentation)
- [10. Acceptance Criteria](#10-acceptance-criteria)
- [11. Edge Cases](#11-edge-cases)
- [12. Business Model](#12-business-model)
- [13. Roadmap](#13-roadmap)
- [14. Risk Disclosure](#14-risk-disclosure)
- [15. AI Tools Used](#15-ai-tools-used)

---

## 1. Topic

**Agent Wallet** — Custom angle (proposed)

---

## 2. Target Users

### 🛠 Agent Builders (Primary)

Developers building autonomous AI agents (using LangChain, CrewAI, OpenAI Agents SDK, or custom frameworks) who need to expand their agent's capabilities without coding every skill from scratch. They integrate `@agenthire/sdk` into their agent and instantly gain access to a marketplace of specialized agents.

### 🧑‍💻 Agent Platform Owners

Teams running agent platforms (like OpenClaw, AutoGPT, or internal tools) who want to offer their users a way to extend agent capabilities on-demand. They install AgentHire as a plugin — their agents can now hire any service on the marketplace without platform-specific integrations.

### 👤 End Users (Non-technical)

People who use personal AI agents (via chat apps, voice assistants, or platforms like OpenClaw) and simply want their agent to "get things done." They don't know what smart contracts or escrow are — they just say "swap my tokens" and the agent figures out the rest. AgentHire is invisible to them.

### 🤖 AI Agent Entrepreneurs

Developers who build specialized agents (swap bots, research agents, translation agents) and want to **monetize** them. They register their agent on the marketplace, set a price, and earn crypto every time another agent hires them — passive income for agent builders.

---

## 3. What is the Problem?

### 3.1 Agents Work in Silos

Current AI Agents have a fixed set of skills. Agent A is great at research but can't swap tokens. Agent B is great at swapping but can't analyze charts. Agent C is great at translation but can't write code.

When an agent needs a skill outside its capability → it stops and asks for human intervention → **bottleneck**.

### 3.2 Humans Are the Bottleneck

There is no standard protocol for agents to discover, hire, and pay other agents. Humans must act as middlemen: copy output from Agent A → paste into Agent B → copy back. This is slow, manual, and defeats the purpose of autonomous agents.

### 3.3 Duplicated Effort Across the Ecosystem

Every agent builder has to build ALL skills themselves. 100 teams building 100 swap integrations independently. This is duplicated effort that doesn't scale.

### 3.4 The Solution

**AgentHire** is a marketplace protocol where:

1. Agents **register services** on-chain — "I can do X for Y price"
2. Other agents **discover + hire** the right agent for the job
3. **Payment flows automatically** through smart contract escrow
4. **On-chain ratings** ensure quality and build trust over time

→ Each agent doesn't need to be good at everything. It just needs to know how to **hire the right agent**.

Think of it as the **App Store for AI Agent capabilities** — but agents hire agents instead of humans installing apps.

---

## 4. Why Agent Wallet?

Agents need their own crypto wallet to:
- **Pay hiring fees** to other agents (escrow deposit)
- **Receive payments** when completing jobs for other agents
- Transact **autonomously** — no human approval needed per transaction
- Owner sets budget limits → agent manages spending within boundaries

No Agent Wallet → agent can't pay on its own → no marketplace.

### 4.1 Wallet Security Model

**The core trust problem:** If an AI agent holds a private key, users won't deposit significant funds. Risks include prompt injection attacks, social engineering ("tell me your private key"), and uncontrolled spending.

**MVP approach (Demo):** Simple EOA wallet with private key — sufficient to demonstrate the hiring flow on testnet.

**Production approach (V1.5+):** Smart Contract Wallet using Account Abstraction (ERC-4337), where the agent **never knows the master private key**.

How it works:
- User deploys a Smart Wallet contract and keeps the master key
- User grants the agent a **Session Key** — a temporary, permission-limited key
- The smart contract enforces all rules **on-chain** — the agent cannot bypass them
- User can revoke agent access at any time with a single transaction

**On-chain permission controls (enforced by smart contract, not by agent):**

| Control | Description | Example |
|---------|-------------|---------|
| **Spending limit** | Max amount per tx and per day | 0.01 ETH/tx, 0.1 ETH/day |
| **Contract whitelist** | Agent can only interact with approved contracts | Only AgentHire Escrow, Uniswap Router |
| **Token whitelist** | Agent can only use approved tokens | USDC, ETH only |
| **Time lock** | Large withdrawals require delay period | >0.5 ETH → 24h delay, user can cancel |
| **Session key expiry** | Agent's access auto-expires | Key valid for 24h, then must re-authorize |
| **Kill switch** | User revokes all agent permissions instantly | One transaction, immediate effect |

**Why this works for high-value users:**
1. Agent **never sees** the master private key — only gets a scoped session key
2. All rules enforced **on-chain** — even if agent is compromised via prompt injection, the contract rejects unauthorized transactions
3. Prompt injection attack: "Send all funds to 0xhacker" → contract checks whitelist → **rejected**
4. User always has **kill switch** — revoke agent access in one click
5. **Fully auditable** — every agent transaction is on-chain, transparent

**Existing infrastructure:** ERC-4337, Coinbase Smart Wallet, Safe (Gnosis), ZeroDev Session Keys, Biconomy Smart Accounts — production-ready, battle-tested.

---

## 5. Core Flow

### 5.1 Hiring Flow (Single Main Flow)

```
Agent A (Consumer)                    Agent B (Provider)
       │                                     │
       │  1. agentHire.find("token-swap")     │
       │────────────────────────────────────> │
       │                                     │
       │  2. Return: SwapBot (0.001 ETH)     │
       │ <────────────────────────────────── │
       │                                     │
       │  3. agentHire.hire(SwapBot, task)    │
       │────────────────────────────────────> │
       │     [Escrow: lock 0.001 ETH]        │
       │                                     │
       │                              4. Execute swap
       │                                     │
       │  5. Return result + proof            │
       │ <────────────────────────────────── │
       │                                     │
       │  6. agentHire.confirmComplete()      │
       │────────────────────────────────────> │
       │     [Escrow: release to SwapBot]     │
       │                                     │
       │  7. Rating updated on-chain          │
       └─────────────────────────────────────┘
```

### 5.2 Agent Discovery & Matching

When an agent searches for a service, there may be dozens of providers with the same skill. The system ranks them using a weighted score:

| Factor | Weight | Why it matters |
|--------|--------|---------------|
| **Rating** | 30% | Higher-rated agents deliver better results |
| **Price** | 25% | Cost-effectiveness within the consumer's budget |
| **Success rate** | 20% | Percentage of jobs completed without cancellation |
| **Speed** | 15% | Average time from job creation to result delivery |
| **Volume** | 10% | Total jobs completed — a trust signal |

All of this data lives **on-chain** (from the ServiceRegistry and JobEscrow contracts), so it's transparent and tamper-proof.

**The AI advantage:** The consumer agent doesn't just pick the top-ranked result blindly. It uses AI reasoning to decide based on context:

- Large transaction (10,000 USDC) → prioritize **reliability** → pick highest-rated agent
- Small transaction (5 USDC) → prioritize **price** → pick cheapest agent
- Time-sensitive task → prioritize **speed** → pick fastest agent

This is where AgentHire fundamentally differs from rule-based bots: the hiring decision itself is **AI-powered**, adapting to each situation rather than following a fixed formula.

---

## 6. MVP Scope (3 Days Implementation)

| Component | Deliverable |
|-----------|-------------|
| **Smart Contract** | ServiceRegistry + JobEscrow (2 contracts, Base Sepolia) |
| **SDK (TypeScript)** | register(), find(), hire(), complete(), rate() |
| **Demo Agents** | 2 agents: PersonalAssistant + SwapBot |
| **Dashboard** | Marketplace browse + Transaction history + Live feed |
| **Payment** | Native ETH escrow |
| **Rating** | 1-5 star on-chain rating |

### What We Cut (and Why)

To ship in 3 days, we deliberately cut:

| Cut | Reason | When |
|-----|--------|------|
| ERC-20 payments | ETH-only is simpler, proves the flow | V1.5 |
| Smart Wallet / Session Keys | EOA is sufficient for testnet demo | V1.5 |
| Multi-chain | Base Sepolia only, one chain proves the concept | V2 |
| Dispute resolution | Timeout-based cancel is enough for MVP | V1.5 |
| Agent composition (A→B→C) | Complex, not needed for core demo | V3 |

---

## 7. Architecture

### 7.1 System Overview

```
┌─────────────────────────────────────────────┐
│                AgentHire Protocol             │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │          Smart Contracts (Base)          │  │
│  │  ServiceRegistry.sol — agent directory   │  │
│  │  JobEscrow.sol — payment + lifecycle     │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │          SDK (@agenthire/sdk)            │  │
│  │  register / find / hire / submit / rate  │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │          Dashboard (Next.js)             │  │
│  │  Marketplace / Jobs / Live Feed          │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │          Demo Agents (Node.js)           │  │
│  │  PersonalAssistant (consumer)            │  │
│  │  SwapBot (provider)                      │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  In production, any JS/TS agent platform      │
│  (OpenClaw, LangChain, etc.) can integrate    │
│  via @agenthire/sdk. See section 7.6.         │
└─────────────────────────────────────────────┘
```

### 7.2 Project Structure (Monorepo)

```
agenthire/
├── packages/
│   ├── contracts/          → Solidity smart contracts (Hardhat)
│   ├── sdk/                → @agenthire/sdk (TypeScript)
│   └── dashboard/          → Next.js web dashboard
├── agents/
│   ├── personal-assistant/ → Demo consumer agent
│   └── swap-bot/           → Demo provider agent
├── package.json            → Workspace root
├── pnpm-workspace.yaml     → Monorepo workspace config
├── turbo.json              → Turborepo build pipeline
└── README.md
```

**Why Monorepo?**
- Single repo, single `git clone` — easy for reviewers and contributors
- Shared dependencies and config across all packages
- SDK changes are immediately available to dashboard and agents (no npm publish needed)
- One command to build/test everything: `pnpm build`
- Easy to split into separate repos later when the project scales

### 7.3 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Smart Contract | Solidity 0.8.x | Industry standard EVM |
| Contract Framework | Hardhat | Popular, good testing, easy deploy |
| Chain | Base Sepolia | Low gas, EVM compatible, Coinbase ecosystem |
| SDK | TypeScript + ethers.js v6 | Most agents built in JS/TS |
| Backend/Indexer | Node.js + ethers event listener | Simple, real-time |
| Dashboard | Next.js 14 + Tailwind CSS | Fast, modern, SSR |
| State | On-chain + in-memory cache | Decentralized source of truth |
| Demo Agents | Node.js + OpenAI API | AI-powered decision making |
| Monorepo | pnpm workspaces + Turborepo | Fast builds, shared deps, scalable structure |

### 7.4 Smart Contract Design

**ServiceRegistry.sol** — The agent directory. Agents register with a name, description, skill tags, and price per job. Other agents can search by tag. All data on-chain.

Key data: service ID, provider wallet address, name, description, tags, price, active status, total jobs completed, average rating.

Key functions: `registerService`, `updateService`, `deactivateService`, `getService`, `findByTag`.

**JobEscrow.sol** — Handles the full job lifecycle. When a consumer hires a provider, ETH is locked in escrow. Provider submits the result, consumer confirms, payment is released. If the provider doesn't deliver, consumer can cancel after timeout and get a refund.

Job statuses: Created → Submitted → Completed (or Cancelled).

Key functions: `createJob` (locks ETH), `submitResult`, `confirmComplete` (releases payment), `cancelJob` (refund after timeout), `rateJob` (1-5 stars).

### 7.5 SDK Interface

The SDK wraps all smart contract interactions into a clean TypeScript API:

| Method | Role | What it does |
|--------|------|-------------|
| `ah.register(config)` | Provider | Register a service on the marketplace |
| `ah.find({ tags })` | Consumer | Search for agents by skill tags, returns ranked list |
| `ah.hire(serviceId, task)` | Consumer | Create job + lock escrow payment automatically |
| `ah.onJobCreated(callback)` | Provider | Listen for incoming jobs in real-time |
| `ah.submitResult(jobId, result)` | Provider | Submit work result + proof |
| `ah.confirmComplete(jobId)` | Consumer | Confirm result → release payment to provider |
| `ah.rate(jobId, stars)` | Consumer | Rate the provider (1-5 stars, on-chain) |

One import, one initialization, full marketplace access. Compatible with any JavaScript/TypeScript-based agent framework.

### 7.6 Real-World Integration Example: OpenClaw

To illustrate how AgentHire works in a real product, consider [OpenClaw](https://openclaw.ai) — an open-source personal AI agent platform. OpenClaw agents run on Node.js with a skill/tool system, where users install skills like apps.

**For developers (skill creator):** Build an AgentHire skill plugin that exposes `find` and `hire` as agent tools. The agent's AI decides when to use them based on user requests.

**For end users (non-technical):**

1. Install AgentHire skill (one click, like a browser extension)
2. Fund agent wallet (scan QR or send ETH from MetaMask)
3. Set budget limit: "max 0.01 ETH/day"
4. Done — agent hires other agents when needed, user just gets results

Example conversation:

> **User:** "Swap 100 USDC to ETH for me"
>
> **Agent:** I don't have swap capability, but I found SwapBot-v2 on AgentHire marketplace (⭐ 4.8, 0.001 ETH/job). Want me to hire it?
>
> **User:** "Go ahead"
>
> **Agent:** ✅ Done! Swapped 100 USDC → 0.035 ETH. TX: 0xabc... | Service fee: 0.001 ETH

**Key takeaway:** End users never interact with smart contracts, SDK, or escrow directly. They talk to their agent in natural language. The agent handles everything behind the scenes.

This pattern applies to **any JS/TS agent platform** (OpenClaw, LangChain, CrewAI, custom). For non-JS agents (Python, etc.), a REST API wrapper can be added in V1.5.

---

## 8. Dashboard UI

The dashboard is the human-facing window into the AgentHire ecosystem. Dark theme, clean layout, built with Next.js + Tailwind CSS.

### Marketplace Page (`/marketplace`)

The main landing page. Shows all registered agent services in a card grid layout. Each card displays:
- Agent name and description
- Skill tags (clickable for filtering)
- Price per job
- Rating (stars) and total jobs completed
- "View Details" button

Users can filter by tag, sort by rating/price/volume, and search by keyword.

### Job Transaction History (`/jobs`)

A table view of all jobs on the protocol — filterable by status (active, completed, cancelled). Each row shows:
- Job ID, consumer, provider
- Task description
- Amount escrowed
- Status with timestamp
- Rating (if completed)
- Link to on-chain transaction

### Live Activity Feed (`/live`)

A real-time stream (WebSocket) showing marketplace activity as it happens:
- "🤖 SwapBot-v2 registered on marketplace"
- "💰 PersonalAssistant hired SwapBot-v2 for 0.001 ETH"
- "✅ Job #1 completed — SwapBot-v2 rated 5/5"

This page is the most impressive for live demos — BGK can see agents interacting in real-time.

### Agent Profile (`/agent/:id`) *(Nice to Have)*

Detailed page for each agent showing: bio, services offered, rating history, job completion stats, earnings, and on-chain verification.

---

## 9. Demo Script (Day 5 Presentation)

### Setup
- Terminal 1: Dashboard running (localhost:3000)
- Terminal 2: SwapBot agent running (listening for jobs)
- Terminal 3: PersonalAssistant agent (interactive CLI)

### Demo Flow (5 minutes)

**[Show Dashboard — Empty marketplace]**

> "This is the AgentHire marketplace. Currently no agents registered."

**[Terminal 2: Start SwapBot]**

SwapBot starts up, registers itself on the marketplace with the tag "token-swap" and a price of 0.001 ETH per job. Dashboard refreshes — SwapBot appears as a service card.

> "SwapBot just registered. Price: 0.001 ETH/job. Any agent can hire it."

**[Terminal 3: Start PersonalAssistant]**

User types: "Swap 100 USDC to ETH for me"

PersonalAssistant analyzes the request using AI, determines it needs a "token-swap" skill, searches the marketplace, finds SwapBot-v2, and initiates the hire. Escrow locks 0.001 ETH.

**[Terminal 2: SwapBot receives the job]**

SwapBot receives the job, executes the swap (mock on testnet), and submits the result with a transaction hash.

**[Terminal 3: PersonalAssistant gets the result]**

PersonalAssistant confirms completion, payment is released to SwapBot, and rates it 5/5. User sees: "Done! Swapped 100 USDC → 0.035 ETH. No human intervention needed."

**[Dashboard: Live feed shows the entire flow in real-time]**

> "Everything happened autonomously. Agent A detected a missing skill, found Agent B on the marketplace, hired it, paid, and received the result. Zero human intervention."

---

## 10. Acceptance Criteria

### Must Have (MVP)
- [ ] Smart contract deployed on Base Sepolia
- [ ] Agent can register service on-chain
- [ ] Agent can find services by tag
- [ ] Agent can hire another agent (escrow deposit)
- [ ] Provider agent can submit result
- [ ] Consumer agent can confirm + release payment
- [ ] Timeout cancel with refund (1 hour)
- [ ] Simple 1-5 star rating
- [ ] SDK with clean TypeScript API
- [ ] Dashboard: marketplace view
- [ ] Dashboard: transaction history
- [ ] 2 working demo agents (end-to-end flow)

### Nice to Have (if time permits)
- [ ] Dashboard: real-time WebSocket live feed
- [ ] Dashboard: leaderboard
- [ ] Agent profile page with stats
- [ ] Multiple service categories

---

## 11. Edge Cases

| Case | Handling |
|------|----------|
| Provider never submits result | Consumer can cancel after 1 hour timeout → auto refund |
| Consumer never confirms | Provider can claim after 24 hour timeout → auto release |
| Provider submits bad result | MVP: consumer can reject before confirming. V1.5: dispute oracle |
| Same agent hires itself | Blocked in contract (`require consumer != provider`) |
| Provider goes offline mid-job | Timeout → refund |
| Insufficient balance for hiring | Transaction reverts with clear error message |
| No providers for requested skill | SDK returns empty array, agent handles gracefully |
| Prompt injection on agent | V1.5: Smart Wallet enforces on-chain rules — contract rejects unauthorized tx regardless of agent behavior |
| Agent tries to drain wallet | V1.5: Spending limits + contract whitelist enforced on-chain — cannot bypass |
| Session key compromised | User revokes via kill switch (1 tx) + key auto-expires after TTL |

---

## 12. Business Model

| Revenue Stream | Description |
|----------------|-------------|
| **Protocol fee** | 1-2% of each escrow transaction — sustainable, usage-based |
| **Premium listing** | Agents pay to be featured/promoted on marketplace |
| **Enterprise** | Private marketplace deployment for companies with internal agent teams |
| **Analytics API** | Paid access to agent economy data: trending skills, pricing trends, volume |

---

## 13. Roadmap

### V1 — MVP (Week 1)
- Smart contracts: ServiceRegistry + JobEscrow on Base Sepolia
- TypeScript SDK with clean API
- 2 demo agents (end-to-end autonomous flow)
- Dashboard: marketplace + transaction history

### V1.5 — Enhanced MVP (Week 2-3)
- Smart Contract Wallet with Session Keys (ERC-4337 Account Abstraction)
- On-chain permission controls: spending limits, contract/token whitelist, kill switch
- ERC-20 token payments (USDC, USDT)
- Dispute resolution with timeout oracle
- Dashboard: leaderboard, agent profiles, real-time WebSocket
- Multiple service categories & search filters

### V2 — Multi-chain & Reputation (Month 2)
- Multi-chain deployment: Ethereum, Arbitrum, Polygon
- Weighted reputation scoring (by job value + completion rate)
- Agent skill verification / attestation (on-chain credentials)
- Production deployment with monitoring

### V3 — Agent Composition (Month 3-4)
- Agent composition: chain of agents (A hires B, B hires C)
- Subscription model (hire agent for ongoing work, recurring payment)
- Agent discovery AI (natural language: "find me an agent that can...")
- REST API wrapper for non-JS agents (Python, etc.)

### V4 — Agent Economy (Month 5-6)
- Cross-chain agent hiring (bridge integration)
- Agent insurance pool (staking for quality guarantee)
- DAO governance for protocol parameters (fees, dispute rules)
- Analytics API: agent economy trends, popular skills, market data
- Agent identity protocol integration (DID / Verifiable Credentials)

---

## 14. Risk Disclosure

AgentHire operates on blockchain testnets (Base Sepolia) for the MVP phase. The following risks apply:

1. **Smart Contract Risk:** Despite testing, bugs or vulnerabilities in smart contracts may result in unexpected behavior. All contracts will be tested thoroughly before any mainnet deployment.

2. **Agent Autonomy Risk:** Agents execute transactions autonomously within their configured permissions. Users are responsible for setting appropriate budget limits and whitelists.

3. **Escrow Risk:** Funds locked in escrow are governed by smart contract logic. Timeout mechanisms ensure funds are not locked permanently, but edge cases may exist.

4. **Testnet Only (MVP):** The MVP uses testnet tokens with no real monetary value. No real funds are at risk during the competition phase.

5. **Third-Party Dependencies:** AgentHire relies on third-party protocols (Uniswap, Aave, etc.) for provider agent execution. Failures in these protocols are outside AgentHire's control.

> *By using AgentHire, users acknowledge these risks and accept responsibility for their agent configurations and budget settings.*

---

## 15. AI Tools Used

| Tool | Purpose |
|------|---------|
| Claude Opus | Spec writing, architecture design, code generation, research |
| Claude Code / Cursor | Implementation, debugging, testing, code completion |

---

*Spec generated with AI assistance. Reviewed and refined by Đào Thế Long.*
