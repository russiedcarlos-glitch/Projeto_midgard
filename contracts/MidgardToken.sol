// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MidgardToken (MDG)
 * @dev Token nativo do protocolo Midgard. Utilizado para staking, recompensas e governança.
 * @author Desenvolvedor Humano
 */
contract MidgardToken is ERC20, Ownable {
    
    // Total supply inicial será distribuído ao owner.
    // Em um cenário real, isso poderia ser um modelo inflacionário (mintável)
    // para distribuir rewards, mas aqui controlaremos com o owner mintando sob demanda ou via staking.
    constructor(address initialOwner) 
        ERC20("MidgardToken", "MDG") 
        Ownable(initialOwner) 
    {
        // Cunhagem inicial de 1.000.000 tokens para o pool de liquidez/recompensas do deployer
        _mint(initialOwner, 1000000 * 10 ** decimals());
    }

    /**
     * @dev Permite ao owner (ou um contrato autorizado, como o Staking) cunhar novos tokens.
     * Necessário para manter o fluxo de recompensas.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
