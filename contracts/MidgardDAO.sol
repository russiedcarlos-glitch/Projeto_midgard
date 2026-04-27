// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MidgardDAO
 * @dev DAO simplificada para o MVP.
 * Permite que detentores de MDG criem propostas e votem.
 */
contract MidgardDAO {
    IERC20 public governanceToken;

    struct Proposal {
        uint256 id;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 endTime;
        bool executed;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Configuração da DAO
    uint256 public votingDuration = 3 days;
    uint256 public minimumTokensToPropose = 100 * 10**18; // Precisa de 100 MDG para propor

    event ProposalCreated(uint256 id, string description, uint256 endTime);
    event Voted(uint256 proposalId, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 id, bool passed);

    constructor(address _governanceToken) {
        governanceToken = IERC20(_governanceToken);
    }

    function createProposal(string memory _description) external {
        require(governanceToken.balanceOf(msg.sender) >= minimumTokensToPropose, "Not enough tokens to propose");

        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            description: _description,
            forVotes: 0,
            againstVotes: 0,
            endTime: block.timestamp + votingDuration,
            executed: false
        });

        emit ProposalCreated(proposalCount, _description, proposals[proposalCount].endTime);
    }

    function vote(uint256 _proposalId, bool _support) external {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp < proposal.endTime, "Voting period has ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted on this proposal");

        uint256 voterWeight = governanceToken.balanceOf(msg.sender);
        require(voterWeight > 0, "No voting power");

        if (_support) {
            proposal.forVotes += voterWeight;
        } else {
            proposal.againstVotes += voterWeight;
        }

        hasVoted[_proposalId][msg.sender] = true;

        emit Voted(_proposalId, msg.sender, _support, voterWeight);
    }

    function executeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp >= proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");

        proposal.executed = true;

        bool passed = proposal.forVotes > proposal.againstVotes;
        
        // No MVP, apenas registramos a execução.
        // Numa versão completa, poderíamos executar uma transação arbitrária aqui.
        
        emit ProposalExecuted(_proposalId, passed);
    }
}
