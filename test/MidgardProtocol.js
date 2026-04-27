import { expect } from "chai";
import { network } from "hardhat";

describe("Midgard Protocol MVP", function () {
  let ethers;
  let token, nft, staking, dao, mockOracle;
  let owner, addr1, addr2;
  let initialSupply;

  before(async function () {
    const networkEnv = await network.create();
    ethers = networkEnv.ethers;
    initialSupply = ethers.parseUnits("1000000", 18);

    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy Token
    const Token = await ethers.getContractFactory("MidgardToken");
    token = await Token.deploy(owner.address);

    // Deploy NFT
    const NFT = await ethers.getContractFactory("MidgardBuilderPass");
    nft = await NFT.deploy(owner.address);

    // Deploy Mock Oracle ($3500)
    const MockOracle = await ethers.getContractFactory("MockV3Aggregator");
    // 8 decimals, 3500 * 10^8
    mockOracle = await MockOracle.deploy(8, 350000000000n);

    // Deploy Staking
    const Staking = await ethers.getContractFactory("MidgardStaking");
    staking = await Staking.deploy(await token.getAddress(), await mockOracle.getAddress(), owner.address);

    // Transferir Ownership do token para o Staking poder mintar rewards
    await token.transferOwnership(await staking.getAddress());

    // Deploy DAO
    const DAO = await ethers.getContractFactory("MidgardDAO");
    dao = await DAO.deploy(await token.getAddress());
  });

  it("Should have correct initial token supply", async function () {
    const ownerBalance = await token.balanceOf(owner.address);
    expect(ownerBalance).to.equal(initialSupply);
  });

  it("Should mint NFT", async function () {
    await nft.safeMint(addr1.address, "ipfs://test");
    expect(await nft.balanceOf(addr1.address)).to.equal(1n);
    expect(await nft.ownerOf(0)).to.equal(addr1.address);
  });

  it("Should allow staking and unstaking", async function () {
    const stakeAmount = ethers.parseUnits("100", 18);
    
    // Passar tokens para addr1 e aprovar
    await token.transfer(addr1.address, stakeAmount);
    await token.connect(addr1).approve(await staking.getAddress(), stakeAmount);

    // Stake
    await staking.connect(addr1).stake(stakeAmount);
    let stakeInfo = await staking.stakes(addr1.address);
    expect(stakeInfo.amount).to.equal(stakeAmount);

    // Unstake
    await staking.connect(addr1).unstake();
    stakeInfo = await staking.stakes(addr1.address);
    expect(stakeInfo.amount).to.equal(0n);
  });

  it("Should allow creating proposals and voting in DAO", async function () {
    const amount = ethers.parseUnits("200", 18);
    await token.transfer(addr2.address, amount);

    await dao.connect(addr2).createProposal("Test Proposal");
    let proposal = await dao.proposals(1);
    expect(proposal.description).to.equal("Test Proposal");

    await dao.connect(addr2).vote(1, true);
    proposal = await dao.proposals(1);
    expect(proposal.forVotes).to.equal(amount);
  });
});
