import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Conectando à rede Sepolia...");
  
  const rpcUrl = process.env.SEPOLIA_RPC_URL || 
    (process.env.INFURA_API_KEY ? `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}` : "https://rpc.sepolia.org");

  console.log(`Usando RPC: ${rpcUrl}`);

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  const network = await provider.getNetwork();
  console.log(`\n✅ Conectado com sucesso!`);
  console.log(`Nome da Rede: ${network.name}`);
  console.log(`Chain ID: ${network.chainId}`);

  const blockNumber = await provider.getBlockNumber();
  console.log(`Último Bloco: ${blockNumber}`);

  if (process.env.PRIVATE_KEY) {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = await wallet.getAddress();
    const balance = await provider.getBalance(address);
    console.log(`\n✅ Carteira Carregada!`);
    console.log(`Endereço: ${address}`);
    console.log(`Saldo: ${ethers.utils.formatEther(balance)} ETH`);
  } else {
    console.log(`\n❌ Nenhuma PRIVATE_KEY encontrada no .env`);
  }
}

main().catch((error) => {
  console.error("\n❌ Erro de Conexão:");
  console.error(error);
  process.exitCode = 1;
});
