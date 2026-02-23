#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Hardhat default accounts (pre-funded with 10000 ETH each)
DEPLOYER_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
SWAPBOT_KEY="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
ASSISTANT_KEY="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"

TSNODE="$ROOT_DIR/node_modules/.bin/ts-node --project $ROOT_DIR/tsconfig.scripts.json"

echo "=== AgentHire Local Demo ==="
echo ""

# Step 1: Start Hardhat node in background
echo "[1/5] Starting Hardhat node..."
cd "$ROOT_DIR/packages/contracts"
npx hardhat node &
HH_PID=$!
sleep 4

# Step 2: Deploy contracts
echo "[2/6] Deploying contracts..."
npx hardhat run scripts/deploy.ts --network localhost

# Step 2.5: Deploy DEX contracts
echo "[2.5/6] Deploying DEX contracts..."
npx hardhat run scripts/deploy-dex.ts --network localhost

# Step 3: Propagate addresses
echo "[3/6] Propagating contract addresses..."
cd "$ROOT_DIR"
$TSNODE scripts/post-deploy.ts

# Step 4: Write private keys
echo "[4/6] Writing private keys..."

update_env_key() {
  local envfile="$1"
  local key="$2"
  local value="$3"
  if [ -f "$envfile" ] && grep -q "^${key}=" "$envfile"; then
    sed -i '' "s|^${key}=.*|${key}=${value}|" "$envfile"
  else
    echo "${key}=${value}" >> "$envfile"
  fi
}

update_env_key "$ROOT_DIR/agents/swap-bot/.env" "PRIVATE_KEY" "$SWAPBOT_KEY"
update_env_key "$ROOT_DIR/agents/personal-assistant/.env" "PRIVATE_KEY" "$ASSISTANT_KEY"

echo ""
echo "[5/6] Starting agents..."
echo "======================================"
echo ""
echo "  Dashboard:  http://localhost:3000"
echo "  Hardhat:    http://127.0.0.1:8545"
echo ""
echo "  Press Ctrl+C to stop everything."
echo ""
echo "======================================"
echo ""

# Start dashboard
cd "$ROOT_DIR/packages/dashboard"
npx next dev &
DASH_PID=$!
sleep 3

# Start SwapBot (uses its own tsconfig via its package)
echo ""
echo "[SwapBot] Starting..."
cd "$ROOT_DIR/agents/swap-bot"
$ROOT_DIR/node_modules/.bin/ts-node --project tsconfig.json src/index.ts &
SWAP_PID=$!
sleep 5

# Start PersonalAssistant (simple mode - no OpenAI needed)
echo ""
echo "[PersonalAssistant] Starting in simple mode..."
cd "$ROOT_DIR/agents/personal-assistant"
$ROOT_DIR/node_modules/.bin/ts-node --project tsconfig.json src/simple.ts

# Cleanup
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $HH_PID $DASH_PID $SWAP_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

wait
