const hre = require("hardhat");

async function main() {
  console.log("Conectando à rede Sepolia...");
  
  // Obter a rede atual
  const network = await hre.ethers.provider.getNetwork();
  console.log(`\n✅ Conectado com sucesso!`);
  console.log(`Nome da Rede: ${network.name}`);
  console.log(`Chain ID: ${network.chainId}`);

  // Verificar o último bloco para garantir que o RPC está respondendo
  const blockNumber = await hre.ethers.provider.getBlockNumber();
  console.log(`Último Bloco: ${blockNumber}`);

  // Obter as contas configuradas (devem vir da PRIVATE_KEY)
  const signers = await hre.ethers.getSigners();
  if (signers.length > 0) {
    const address = signers[0].address;
    const balance = await hre.ethers.provider.getBalance(address);
    console.log(`\n✅ Carteira Carregada!`);
    console.log(`Endereço: ${address}`);
    console.log(`Saldo: ${hre.ethers.formatEther(balance)} ETH`);
  } else {
    console.log(`\n❌ Nenhuma carteira encontrada. Verifique se a PRIVATE_KEY está correta no .env`);
  }
}

main().catch((error) => {
  console.error("\n❌ Erro de Conexão:");
  console.error(error);
  process.exitCode = 1;
});
