# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.3.0] - 2026-02-24

### Added

#### Dashboard UI Overhaul
- `framer-motion` — scroll-triggered animations, page transitions, staggered entrances
- `lenis` — smooth scroll across all pages
- Motion components: `AnimateIn`, `StaggerContainer`, `CountUp`, `TextReveal`, `SmoothScroll`
- Three.js hero — particle constellation with connection lines (`HeroScene.tsx`)
- Landing sections: `StatsBar` (animated counters), `BentoGrid` (asymmetric feature grid), `ProtocolFlow` (4-step flow), `TechLogos` (infinite marquee)
- Navbar — animated active pill (`layoutId`), mobile slide-in menu with `AnimatePresence`, scroll-based blur/opacity
- BackgroundEffect — animated gradient orbs with slow drift, dot grid, radial vignette, grain overlay
- CSS — grain overlay, glow-border hover effect, float/pulse-glow/marquee/orbDrift keyframes, glow color vars, timing vars
- Dashboard pages — page transition animations, staggered card grid, skeleton loading, animated filter tabs (`layoutId`), timeline live feed layout with Lucide icons
- ServiceCard — `whileHover` scale, glow blur layer, price badge glow shadow
- JobRow — color-coded left accent bar on hover by job status
- Docs — CopyMarkdown button moved from body to TOC sidebar header via `tableOfContent.header`

#### Provider SDK Content Update
- Hero description — reflects two-sided marketplace (hire agents + earn ETH via MCP)
- BentoGrid — replaced "Universal Framework" / "AI-Powered Matching" with **MCP Integration** and **Provider SDK** cards
- ProtocolFlow — expanded from 3 to 4 steps (Search → Hire → Execute → Settle), Execute step mentions Cursor/Claude Code/MCP providers
- Code block — dual-tab switcher: `consumer.ts` (Marketplace.hire) + `provider.ts` (AgentHireProviderSDK.start)
- TechLogos — added Cursor, Claude Code, Windsurf, OpenClaw, MCP
- StatsBar — replaced "Network" metric with "Provider Platforms"
- CTA — changed to "Your AI earns while it works" with provider pitch
- Footer — updated description to two-sided marketplace messaging

### Fixed
- Navbar desktop routes not rendering (Tailwind v4 `hidden md:flex` → `max-md:hidden` pattern)
- `noise-bg` broken SVG data URI in globals.css

## [0.2.0] - 2026-02-23

### Added
- `MockERC20.sol` — ERC20 token with configurable decimals and public `mint()` for testing
- `SimpleDEX.sol` — Fixed-rate DEX contract with `swap()`, `addLiquidity()`, `setRate()`, and `Swapped` event
- `deploy-dex.ts` — Deployment script for MockUSDC (6 dec), MockWETH (18 dec), SimpleDEX with liquidity provisioning
- 15 new Hardhat tests for SimpleDEX: deployment, A→B swap, B→A swap, error cases, access control, full lifecycle (53 total)
- `packages/openclaw-skill/` — SDK-based OpenClaw skill plugin with `agenthire_search`, `agenthire_hire`, `agenthire_status` tools
- `packages/openclaw-skill-standalone/` — Script-based OpenClaw skill using plain ethers.js (no SDK build required), with `search.js`, `hire.js`, `status.js`
- DEX deploy step in `demo-local.sh` (step 2.5/6)
- `dex-deployments.json` check with warning in `demo.sh`
- `demo` and `demo:remote` convenience scripts in root `package.json`

### Changed
- SwapBot now executes real on-chain swaps via SimpleDEX instead of mock 3s delay with fake txHash
- SwapBot submit result includes real `txHash`, `blockNumber`, `basescanUrl` from swap receipt
- SwapBot uses explicit nonce management for Hardhat automining compatibility
- `post-deploy.ts` now reads `dex-deployments.json` and propagates `DEX_ADDRESS`, `USDC_ADDRESS`, `WETH_ADDRESS` to swap-bot `.env`

### Dependencies
- Added `@openzeppelin/contracts` ^5.4.0 to `@agenthire/contracts`
- Added `dotenv` to `@agenthire/contracts`

## [0.1.1] - 2026-02-23

### Security
- `ServiceRegistry.incrementJobCount()` and `addRating()` now restricted with `onlyEscrow` modifier — prevents fake job counts and ratings from arbitrary callers
- Added `owner`, `escrow` state variables and `setEscrow()` function to ServiceRegistry
- Deploy script now calls `registry.setEscrow(escrowAddress)` after deployment

### Added
- Protocol fee: 2% (200 bps) deducted on `confirmComplete` and `claimTimeout`, sent to `feeRecipient` (deployer)
- `totalFeesCollected` tracking on JobEscrow
- `JobCompleted` event now includes `fee` parameter
- 4 new tests: onlyEscrow access control, setEscrow validation, protocol fee tracking (38 total)

### Changed
- PersonalAssistant agents now use `ResultSubmitted` event listener instead of polling `getJob()` every 3s — cleaner and fewer RPC calls

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
- No access control on `incrementJobCount`/`addRating` — fixed in 0.1.1
- Tag index not cleaned on deactivation — filtered client-side in SDK
- ETH-only payments (ERC-20 support planned for V1.5)
