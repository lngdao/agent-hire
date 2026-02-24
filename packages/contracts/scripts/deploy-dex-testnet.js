// deploy-dex-testnet.js — Nonce-safe DEX deployment for testnets
require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load ABIs from artifacts
const MockERC20 = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/MockERC20.sol/MockERC20.json")));
const SimpleDEX = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/SimpleDEX.sol/SimpleDEX.json")));

const SWAPBOT = process.env.SWAPBOT_ADDRESS || "0xEb502CE2Af11e33Bcb3dDa320d7c2e83dEb04506";

async function deploy(wallet, factory, args = []) {
    const cf = new ethers.ContractFactory(factory.abi, factory.bytecode, wallet);
    const nonce = await wallet.getNonce("pending");
    console.log("  nonce:", nonce);
    const contract = await cf.deploy(...args, { nonce });
    await contract.waitForDeployment();
    // Wait for nonce to propagate
    await new Promise(r => setTimeout(r, 3000));
    return contract;
}

async function sendTx(contract, method, args) {
    const wallet = contract.runner;
    const nonce = await wallet.getNonce("pending");
    const tx = await contract[method](...args, { nonce });
    await tx.wait();
    await new Promise(r => setTimeout(r, 3000));
    return tx;
}

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log("Deployer:", wallet.address);
    console.log("Balance:", ethers.formatEther(await provider.getBalance(wallet.address)), "ETH");
    console.log("SwapBot:", SWAPBOT);
    console.log();

    // Deploy USDC
    console.log("Deploying Mock USDC...");
    const usdc = await deploy(wallet, MockERC20, ["Mock USDC", "USDC", 6]);
    const usdcAddr = await usdc.getAddress();
    console.log("Mock USDC:", usdcAddr);

    // Deploy WETH
    console.log("Deploying Mock WETH...");
    const weth = await deploy(wallet, MockERC20, ["Mock WETH", "WETH", 18]);
    const wethAddr = await weth.getAddress();
    console.log("Mock WETH:", wethAddr);

    // Deploy SimpleDEX
    const rate = BigInt("350000000") * ethers.parseUnits("1", 18);
    console.log("Deploying SimpleDEX...");
    const dex = await deploy(wallet, SimpleDEX, [usdcAddr, wethAddr, rate]);
    const dexAddr = await dex.getAddress();
    console.log("SimpleDEX:", dexAddr);

    // Mint tokens
    console.log("\nMinting tokens...");
    await sendTx(usdc, "mint", [wallet.address, ethers.parseUnits("1000000", 6)]);
    console.log("✅ Minted 1,000,000 USDC");

    await sendTx(weth, "mint", [wallet.address, ethers.parseUnits("1000", 18)]);
    console.log("✅ Minted 1,000 WETH");

    // Approve + add liquidity
    console.log("\nAdding liquidity...");
    await sendTx(usdc, "approve", [dexAddr, ethers.parseUnits("500000", 6)]);
    console.log("✅ USDC approved");

    await sendTx(weth, "approve", [dexAddr, ethers.parseUnits("500", 18)]);
    console.log("✅ WETH approved");

    await sendTx(dex, "addLiquidity", [usdcAddr, ethers.parseUnits("500000", 6)]);
    console.log("✅ USDC liquidity added");

    await sendTx(dex, "addLiquidity", [wethAddr, ethers.parseUnits("500", 18)]);
    console.log("✅ WETH liquidity added");

    // Mint USDC for SwapBot
    console.log("\nMinting for SwapBot...");
    await sendTx(usdc, "mint", [SWAPBOT, ethers.parseUnits("10000", 6)]);
    console.log("✅ Minted 10,000 USDC to SwapBot");

    // Save
    const result = {
        network: "base-sepolia",
        chainId: 84532,
        deployer: wallet.address,
        contracts: { MockUSDC: usdcAddr, MockWETH: wethAddr, SimpleDEX: dexAddr },
        deployedAt: new Date().toISOString()
    };
    fs.writeFileSync(path.join(__dirname, "..", "dex-deployments.json"), JSON.stringify(result, null, 2));
    
    console.log("\n🎉 Done! All contracts deployed + funded.");
    console.log("Balance left:", ethers.formatEther(await provider.getBalance(wallet.address)), "ETH");
}

main().catch(e => { console.error(e.message); process.exit(1); });
