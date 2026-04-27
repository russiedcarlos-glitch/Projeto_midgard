// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MidgardBuilderPass (MBP)
 * @dev NFT que garante privilégios na DAO ou bônus no staking.
 * Focado em recompensar construtores ativos.
 */
contract MidgardBuilderPass is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner) 
        ERC721("MidgardBuilderPass", "MBP") 
        Ownable(initialOwner) 
    {}

    /**
     * @dev Função para mintar o passe. Apenas o owner pode distribuir inicialmente.
     * @param to Endereço que receberá o NFT.
     * @param uri URI com os metadados do passe (imagem, descrição).
     */
    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
}
