# 🌐 Midgard Protocol - Web3 MVP

[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.24-363636.svg?style=flat&logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-v3.4.1-yellow.svg?style=flat&logo=hardhat)](https://hardhat.org/)
[![Network](https://img.shields.io/badge/Network-Sepolia_Testnet-blue.svg)](#)

O **Midgard Protocol** é uma plataforma descentralizada (MVP) focada em criar um ecossistema de incentivo financeiro e governança para desenvolvedores e construtores Web3. 

Este repositório contém a implementação completa de Contratos Inteligentes, integrações de Oráculos (Chainlink) e scripts de interação backend com Ethers.js.

---

## 🏗️ Arquitetura do Protocolo

O ecossistema é formado por 4 contratos integrados:

1. 🪙 **MidgardToken (MDG) - `ERC-20`**: O token utilitário da rede. Usado para transferir valor, realizar staking e garantir poder de voto na governança.
2. 🎟️ **MidgardBuilderPass (MBP) - `ERC-721`**: Um NFT não-fungível que atua como uma "Identidade de Construtor" única no ecossistema.
3. 🏦 **MidgardStaking**: Um contrato de liquidez onde usuários depositam `MDG` para ganhar rendimento ao longo do tempo. 
   - 🔗 **Oráculo Integrado**: O rendimento (APY) é dinâmico. Utilizamos a **Chainlink** (Price Feed ETH/USD) para checar o mercado real. Em mercado de alta (ETH > $3000) o rendimento é de 10%. Em mercado de baixa (ETH <= $3000), o rendimento dobra para 20% visando incentivar a retenção dos tokens.
4. 🏛️ **MidgardDAO**: Contrato de Governança Descentralizada onde detentores de `MDG` podem criar propostas de melhoria e votar (Sim/Não) para moldar o futuro do protocolo baseado em seus saldos.

---

## 🚀 Contratos Implantados (Deploy na Sepolia)

Todos os contratos estão vivos na testnet Sepolia e as transações podem ser verificadas através dos links do explorador:

- **MidgardToken (MDG):** [`0xB8e2000E7CfF10a4b56284cFAb3D4761D379c5a4`](https://sepolia.etherscan.io/address/0xB8e2000E7CfF10a4b56284cFAb3D4761D379c5a4)
- **MidgardBuilderPass:** [`0x50F33234772d3Ae1d4b4dBDA187Ad48Df6ECb11F`](https://sepolia.etherscan.io/address/0x50F33234772d3Ae1d4b4dBDA187Ad48Df6ECb11F)
- **MidgardStaking:** [`0x97d73a0BF7917202C5d49Bb272E26c6B2bbEb757`](https://sepolia.etherscan.io/address/0x97d73a0BF7917202C5d49Bb272E26c6B2bbEb757)
- **MidgardDAO:** [`0xBa06205B1232f5da97C9DDCf1cC6c9b05668C64B`](https://sepolia.etherscan.io/address/0xBa06205B1232f5da97C9DDCf1cC6c9b05668C64B)

---

## 🛠️ Instalação e Execução Local

### Pré-requisitos
- [Node.js](https://nodejs.org/en/) (v18+)
- Conta na Metamask configurada na rede Sepolia e com saldo de testes em ETH.

### 1. Clonar e Instalar
```bash
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
cd projeto1
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto seguindo este modelo:
```env
PRIVATE_KEY="sua_chave_privada_da_metamask_aqui"
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
ETHERSCAN_API_KEY="sua_chave_do_etherscan"
```
> **⚠️ CUIDADO:** Nunca adicione sua chave privada a commits. O projeto conta com um arquivo `.gitignore` configurado para impedir o vazamento do `.env`.

### 3. Executar Testes Unitários
A suíte de testes (Mocha/Chai) valida toda a lógica de funcionamento:
```bash
npx hardhat test
```

### 4. Realizar o Deploy
Executar implantação dos contratos na Sepolia:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 5. Interagir com o Protocolo
Este script utiliza o Ethers.js v6 para simular um usuário executando o ciclo completo (Mint NFT -> Stake de Tokens -> Criação e Votação em Proposta da DAO):
```bash
npx hardhat run scripts/interact.js --network sepolia
```

---

## 🛡️ Auditoria e Segurança
A arquitetura de contratos foi desenhada seguindo os princípios de segurança da Web3 (como modificadores `nonReentrant`, uso do `Ownable` da OpenZeppelin e Checks-Effects-Interactions). Consulte o arquivo [Auditoria.md](./Auditoria.md) para visualizar o relatório detalhado de vulnerabilidades mitigadas.
