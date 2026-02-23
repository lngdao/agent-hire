# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-02-23

### Added

#### Smart Contracts (`@agenthire/contracts`)
- `ServiceRegistry.sol` — Agent service directory with register, update, deactivate, findByTag, rating, and job count tracking
- `JobEscrow.sol` — Full job lifecycle with ETH escrow: create → submit → confirm/cancel, 1h consumer cancel timeout, 24h provider claim timeout, 1-5 star rating
- Deploy script saving addresses to `deployments.json`
- 34 Hardhat tests covering registration, access control, full lifecycle, timeouts, and edge cases

#### SDK (`@agenthire/sdk`)
- `AgentHire` class wrapping all contract interactions
- Provider methods: `register()`, `submitResult()`, `onJobCreated()`
- Consumer methods: `find()`, `hire()`, `confirmComplete()`, `rate()`
- View methods: `getService()`, `getJob()`, `getAllServices()`, `getAllJobs()`
- Event listeners: `onServiceRegistered()`, `onJobEvent()`
- Read-only mode (no signer required) for dashboard usage
- Human-readable ABI for ServiceRegistry and JobEscrow

#### Dashboard (`@agenthire/dashboard`)
- Next.js 14 App Router with Tailwind CSS dark theme
- `/marketplace` — Service card grid with tag filtering and sort by rating/price/volume
- `/jobs` — Job table with status filter tabs (All/Created/Submitted/Completed/Cancelled)
- `/live` — Real-time event feed with color-coded event types
- Components: Navbar, ServiceCard, TagBadge, RatingStars, StatusBadge, JobRow, LiveFeedItem
- Polling hooks (15s interval) + event listener hooks for live data
- Base Sepolia network indicator

#### Demo Agents
- **SwapBot** (`@agenthire/swap-bot`) — Provider agent that registers a token-swap service, listens for jobs, simulates a 3s swap, and submits mock results
- **PersonalAssistant** (`@agenthire/personal-assistant`) — Consumer agent with OpenAI-powered skill classification, service discovery, hiring, confirmation, and AI-based rating
- **PersonalAssistant Simple** — Fallback CLI version without OpenAI dependency

#### Infrastructure
- pnpm monorepo with Turborepo build pipeline
- Shared `tsconfig.base.json` (ES2022, strict)
- `scripts/post-deploy.ts` — Propagates contract addresses to all `.env` files
- `scripts/e2e-test.ts` — Full lifecycle test against local Hardhat node
- `scripts/demo.sh` — Starts dashboard + SwapBot + PersonalAssistant
- `.env.example` files for all packages

### Technical Decisions
- Solidity 0.8.24 with `viaIR` compiler (required for nested calldata array storage)
- ethers.js v6 throughout SDK and agents
- No access control on `incrementJobCount`/`addRating` (MVP limitation — production needs `onlyEscrow` modifier)
- Tag index not cleaned on deactivation — filtered client-side in SDK
- ETH-only payments (ERC-20 support planned for V1.5)
