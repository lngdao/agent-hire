#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "=== AgentHire Demo ==="
echo "Root: $ROOT_DIR"
echo ""

# Check if contracts are deployed
if [ ! -f "$ROOT_DIR/packages/contracts/deployments.json" ]; then
  echo "Error: deployments.json not found."
  echo "Deploy contracts first:"
  echo "  cd packages/contracts"
  echo "  npx hardhat run scripts/deploy.ts --network baseSepolia"
  exit 1
fi

# Check if DEX contracts are deployed
if [ ! -f "$ROOT_DIR/packages/contracts/dex-deployments.json" ]; then
  echo "Warning: dex-deployments.json not found."
  echo "SwapBot will not have DEX contracts configured."
  echo "Deploy DEX contracts with:"
  echo "  cd packages/contracts"
  echo "  npx hardhat run scripts/deploy-dex.ts --network baseSepolia"
  echo ""
fi

echo "Starting demo components..."
echo ""
echo "Press Ctrl+C to stop all components."
echo ""

# Start dashboard
echo "[1/3] Starting Dashboard on http://localhost:3000 ..."
cd "$ROOT_DIR/packages/dashboard"
pnpm dev &
DASH_PID=$!

sleep 3

# Start SwapBot
echo "[2/3] Starting SwapBot..."
cd "$ROOT_DIR/agents/swap-bot"
npx ts-node src/index.ts &
SWAP_PID=$!

sleep 5

# Start PersonalAssistant (simple mode)
echo "[3/3] Starting PersonalAssistant (simple mode)..."
cd "$ROOT_DIR/agents/personal-assistant"
npx ts-node src/simple.ts
PA_PID=$!

# Cleanup on exit
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $DASH_PID $SWAP_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

wait
