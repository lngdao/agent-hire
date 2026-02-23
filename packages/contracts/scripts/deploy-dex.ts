import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer, swapBotWallet] = await ethers.getSigners();
  console.log("Deploying DEX contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy Mock USDC (6 decimals)
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const usdc = await MockERC20.deploy("Mock USDC", "USDC", 6);
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("Mock USDC deployed to:", usdcAddress);

  // Deploy Mock WETH (18 decimals)
  const weth = await MockERC20.deploy("Mock WETH", "WETH", 18);
  await weth.waitForDeployment();
  const wethAddress = await weth.getAddress();
  console.log("Mock WETH deployed to:", wethAddress);

  // Deploy SimpleDEX
  // Rate: 1 USDC (1e6 raw) = 0.00035 WETH (3.5e14 raw)
  // Per raw USDC unit: 3.5e14 / 1e6 = 3.5e8 raw WETH
  // Scaled by 1e18: rate = 3.5e8 * 1e18 = 3.5e26
  const rate = BigInt("350000000") * ethers.parseUnits("1", 18);
  const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
  const dex = await SimpleDEX.deploy(usdcAddress, wethAddress, rate);
  await dex.waitForDeployment();
  const dexAddress = await dex.getAddress();
  console.log("SimpleDEX deployed to:", dexAddress);

  // Mint tokens for testing
  console.log("\nMinting tokens...");

  // Mint 1,000,000 USDC to deployer
  await usdc.mint(deployer.address, ethers.parseUnits("1000000", 6));
  console.log("Minted 1,000,000 USDC to deployer");

  // Mint 1,000 WETH to deployer
  await weth.mint(deployer.address, ethers.parseUnits("1000", 18));
  console.log("Minted 1,000 WETH to deployer");

  // Add liquidity to DEX
  console.log("\nAdding liquidity to DEX...");
  await usdc.approve(dexAddress, ethers.parseUnits("500000", 6));
  await weth.approve(dexAddress, ethers.parseUnits("500", 18));
  await dex.addLiquidity(usdcAddress, ethers.parseUnits("500000", 6));
  await dex.addLiquidity(wethAddress, ethers.parseUnits("500", 18));
  console.log("Added 500,000 USDC + 500 WETH liquidity to DEX");

  // Mint 10,000 USDC to SwapBot wallet (Hardhat account #1)
  const swapBotAddress = process.env.SWAPBOT_ADDRESS || swapBotWallet.address;
  await usdc.mint(swapBotAddress, ethers.parseUnits("10000", 6));
  console.log(`Minted 10,000 USDC to SwapBot wallet (${swapBotAddress})`);

  // Save deployment addresses
  const deployments = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    contracts: {
      MockUSDC: usdcAddress,
      MockWETH: wethAddress,
      SimpleDEX: dexAddress,
    },
    rate: rate.toString(),
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "..", "dex-deployments.json");
  fs.writeFileSync(outPath, JSON.stringify(deployments, null, 2));
  console.log("\nDEX deployment info saved to dex-deployments.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
