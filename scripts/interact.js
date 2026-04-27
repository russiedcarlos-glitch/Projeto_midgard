import { network } from "hardhat";

async function main() {
    const { ethers } = await network.create();

    // Endereços dos contratos recém-implantados (devem ser substituídos após o deploy real)
    // Exemplo para testes locais após deploy, você pode colar os endereços aqui se quiser testar isoladamente:
    const tokenAddress = process.env.TOKEN_ADDRESS || "0xB8e2000E7CfF10a4b56284cFAb3D4761D379c5a4";
    const nftAddress = process.env.NFT_ADDRESS || "0x50F33234772d3Ae1d4b4dBDA187Ad48Df6ECb11F";
    const stakingAddress = process.env.STAKING_ADDRESS || "0x97d73a0BF7917202C5d49Bb272E26c6B2bbEb757";
    const daoAddress = process.env.DAO_ADDRESS || "0xBa06205B1232f5da97C9DDCf1cC6c9b05668C64B";

    console.log("--- Iniciando Interação Web3 (ethers.js) ---");

    const [signer] = await ethers.getSigners();
    console.log("Conta:", signer.address);

    // Conectar aos contratos (usando as ABIs geradas pelo hardhat no artifacts/)
    const Token = await ethers.getContractFactory("MidgardToken");
    const token = Token.attach(tokenAddress);

    const NFT = await ethers.getContractFactory("MidgardBuilderPass");
    const nft = NFT.attach(nftAddress);

    const Staking = await ethers.getContractFactory("MidgardStaking");
    const staking = Staking.attach(stakingAddress);

    const DAO = await ethers.getContractFactory("MidgardDAO");
    const dao = DAO.attach(daoAddress);

    // 1. MINT DE NFT
    console.log("\n1. Realizando Mint do NFT MidgardBuilderPass...");
    try {
        const mintTx = await nft.safeMint(signer.address, "ipfs://QmMyUriHash/1.json");
        await mintTx.wait();
        console.log("✅ NFT Mintado com sucesso!");
        const balanceNFT = await nft.balanceOf(signer.address);
        console.log(`Saldo de NFTs: ${balanceNFT.toString()}`);
    } catch(e) {
        console.log("Erro no mint (verifique se já executou o deploy localmente e tem o ownership):", e.message.split('\n')[0]);
    }

    // 2. STAKE DE TOKENS
    console.log("\n2. Realizando Stake de 50 MDG...");
    const stakeAmount = ethers.parseUnits("50", 18);
    try {
        const currentStake = await staking.stakes(signer.address);
        if (currentStake.amount > 0) {
            console.log(`⚠️  Você já tem ${ethers.formatUnits(currentStake.amount, 18)} MDG em stake. Realizando unstake antes de continuar...`);
            const unstakeTx = await staking.unstake();
            await unstakeTx.wait();
            console.log("✅ Unstake realizado com sucesso!");
        }

        // Primeiro precisamos aprovar o contrato de staking a gastar nossos tokens
        const approveTx = await token.approve(stakingAddress, stakeAmount);
        await approveTx.wait();
        console.log("✅ Tokens aprovados para Staking.");

        const stakeTx = await staking.stake(stakeAmount);
        await stakeTx.wait();
        console.log("✅ Stake realizado com sucesso!");
        
        const stakeInfo = await staking.stakes(signer.address);
        console.log(`Você tem em stake: ${ethers.formatUnits(stakeInfo.amount, 18)} MDG`);
    } catch(e) {
        console.log("Erro no stake:", e.message.split('\n')[0]);
    }

    // 3. VOTAÇÃO NA DAO
    console.log("\n3. Criando Proposta e Votando na DAO...");
    try {
        const propTx = await dao.createProposal("Aumentar recompensas do Staking para Builders");
        await propTx.wait();

        const latestProposalId = await dao.proposalCount();
        console.log(`✅ Proposta criada com sucesso! (ID: ${latestProposalId})`);

        // Votando "SIM" (true) na proposta recém-criada
        const voteTx = await dao.vote(latestProposalId, true);
        await voteTx.wait();
        console.log("✅ Voto computado com sucesso!");

        const proposal = await dao.proposals(latestProposalId);
        console.log(`Status da Proposta ${latestProposalId} - Votos Favoráveis: ${ethers.formatUnits(proposal.forVotes, 18)}`);
    } catch(e) {
        console.log("Erro na DAO:", e.message.split('\n')[0]);
    }

    console.log("\n--- Script Finalizado ---");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
