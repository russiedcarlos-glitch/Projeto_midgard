// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// Importando a interface do nosso token para poder usar o mint
interface IMidgardToken is IERC20 {
    function mint(address to, uint256 amount) external;
}

/**
 * @title MidgardStaking
 * @dev Contrato para realizar stake de tokens MDG.
 * Recompensas são ajustadas dinamicamente com base no preço do Ethereum (Oracle).
 */
contract MidgardStaking is ReentrancyGuard, Ownable {
    IMidgardToken public stakingToken;
    AggregatorV3Interface internal priceFeed;

    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => StakeInfo) public stakes;

    uint256 public constant SECONDS_IN_YEAR = 31536000;
    
    // Threshold do preço em USD (com 8 casas decimais, padrão Chainlink para USD)
    // $3000 = 3000 * 10^8
    int256 public priceThreshold = 3000 * 10**8;

    // APYs: 10% (mercado em alta) ou 20% (mercado em baixa para incentivar hold)
    uint256 public apyHighMarket = 10;
    uint256 public apyLowMarket = 20;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    /**
     * @param _stakingToken Endereço do contrato MidgardToken
     * @param _priceFeed Endereço do Chainlink Data Feed (ex: ETH/USD na Sepolia)
     */
    constructor(address _stakingToken, address _priceFeed, address initialOwner) Ownable(initialOwner) {
        stakingToken = IMidgardToken(_stakingToken);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    /**
     * @dev Obtém o preço atual do ETH/USD via Chainlink
     */
    function getLatestPrice() public view returns (int) {
        (
            /* uint80 roundID */,
            int price,
            /* uint startedAt */,
            /* uint timeStamp */,
            /* uint80 answeredInRound */
        ) = priceFeed.latestRoundData();
        return price;
    }

    /**
     * @dev Determina o APY baseado no preço atual
     */
    function getCurrentAPY() public view returns (uint256) {
        int currentPrice = getLatestPrice();
        if (currentPrice > priceThreshold) {
            return apyHighMarket; // Ex: 10%
        } else {
            return apyLowMarket; // Ex: 20%
        }
    }

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");

        // Se o usuario ja tem stake, ele deve sacar antes de adicionar mais
        // Para simplificar o MVP
        require(stakes[msg.sender].amount == 0, "Already staked. Unstake first.");

        // Transfere os tokens para o contrato
        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        stakes[msg.sender] = StakeInfo({
            amount: _amount,
            timestamp: block.timestamp
        });

        emit Staked(msg.sender, _amount);
    }

    /**
     * @dev Calcula a recompensa atual baseada no tempo staked e APY atual
     */
    function calculateReward(address _user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[_user];
        if (userStake.amount == 0) return 0;

        uint256 timeStaked = block.timestamp - userStake.timestamp;
        uint256 apy = getCurrentAPY();

        // Fórmula simples de juros simples: (amount * apy * timeStaked) / (100 * SECONDS_IN_YEAR)
        uint256 reward = (userStake.amount * apy * timeStaked) / (100 * SECONDS_IN_YEAR);
        return reward;
    }

    function claimReward() public nonReentrant {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards to claim");

        // Atualiza o timestamp para não contar a mesma recompensa de novo
        stakes[msg.sender].timestamp = block.timestamp;

        // Minta as recompensas (Requer que este contrato tenha ROLE de minter no token)
        stakingToken.mint(msg.sender, reward);

        emit RewardClaimed(msg.sender, reward);
    }

    function unstake() external nonReentrant {
        StakeInfo memory userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No active stake");

        // Resgata as recompensas pendentes antes de remover o stake
        uint256 reward = calculateReward(msg.sender);

        uint256 amountToReturn = userStake.amount;
        
        // Zera o state antes das transferências (Prevenção de Reentrancy)
        delete stakes[msg.sender];

        // Minta as recompensas pendentes
        if (reward > 0) {
            stakingToken.mint(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }

        // Devolve os tokens de stake
        require(stakingToken.transfer(msg.sender, amountToReturn), "Transfer failed");

        emit Unstaked(msg.sender, amountToReturn);
    }
}
