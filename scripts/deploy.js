import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy MidgardToken
  const nexusToken = await ethers.deployContract("MidgardToken", [deployer.address]);
  await nexusToken.waitForDeployment();
  const tokenAddress = await nexusToken.getAddress();
  console.log("MidgardToken deployed to:", tokenAddress);

  // 2. Deploy MidgardBuilderPass
  const builderPass = await ethers.deployContract("MidgardBuilderPass", [deployer.address]);
  await builderPass.waitForDeployment();
  console.log("MidgardBuilderPass deployed to:", await builderPass.getAddress());

  // 3. Deploy MidgardStaking
  // Endereço do Chainlink Price Feed ETH/USD na Sepolia
  // Fonte: https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1
  const ethUsdPriceFeedSepolia = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
  
  // Se for rede local hardhat e não estiver em fork, não vai ter o contrato do price feed de verdade lá.
  // Idealmente no MVP deveriamos usar um Mock se for local, mas vamos focar no deploy na Sepolia.
  const chainlinkFeed = network.name === "sepolia" ? ethUsdPriceFeedSepolia : ethUsdPriceFeedSepolia;

  const nexusStaking = await ethers.deployContract("MidgardStaking", [tokenAddress, chainlinkFeed, deployer.address]);
  await nexusStaking.waitForDeployment();
  const stakingAddress = await nexusStaking.getAddress();
  console.log("MidgardStaking deployed to:", stakingAddress);

  // Transferir ownership do Token para o Staking Contract poder mintar rewards
  const tx = await nexusToken.transferOwnership(stakingAddress);
  await tx.wait(); // Aguardar a transação ser minerada na Sepolia
  console.log("Ownership of MidgardToken transferred to MidgardStaking contract");

  // 4. Deploy MidgardDAO
  const nexusDAO = await ethers.deployContract("MidgardDAO", [tokenAddress]);
  await nexusDAO.waitForDeployment();
  console.log("MidgardDAO deployed to:", await nexusDAO.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
