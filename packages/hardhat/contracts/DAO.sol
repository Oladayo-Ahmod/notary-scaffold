// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DAO is AccessControl, ReentrancyGuard {
    uint256 private totalProposals;
    uint256 private contractBalance;
    address private contractDeployer;

    uint256 constant MIN_CONTRIBUTION = 0.1 ether;
    uint256 constant MIN_VOTE_DURATION = 5 minutes;
    bytes32 constant ROLE_COLLABORATOR = keccak256("ROLE_COLLABORATOR");
    bytes32 constant ROLE_STAKEHOLDER = keccak256("ROLE_STAKEHOLDER");

    mapping(uint256 => Proposal) private proposals;
    mapping(address => uint256[]) private votesByStakeholder;
    mapping(uint256 => Vote[]) private votesForProposal;
    mapping(address => uint256) private contributorAmounts;
    mapping(address => uint256) private stakeholderAmounts;

    struct Proposal {
        uint256 id;
        uint256 requestedAmount;
        uint256 upVotes;
        uint256 downVotes;
        uint256 votingDeadline;
        string title;
        string description;
        bool fundsPaid;
        bool approved;
        address payable recipient;
        address creator;
        address executor;
    }

    struct Vote {
        address voter;
        uint256 timestamp;
        bool decision;
    }

    modifier onlyStakeholder(string memory errorMessage) {
        require(hasRole(ROLE_STAKEHOLDER, msg.sender), errorMessage);
        _;
    }

    modifier onlyContributor(string memory errorMessage) {
        require(hasRole(ROLE_COLLABORATOR, msg.sender), errorMessage);
        _;
    }

    modifier onlyDeployer(string memory errorMessage) {
        require(msg.sender == contractDeployer, errorMessage);
        _;
    }

    event ProposalEvent(
        address indexed creator,
        bytes32 role,
        string message,
        address indexed recipient,
        uint256 amount
    );

    event VoteEvent(
        address indexed voter,
        bytes32 role,
        string message,
        address indexed recipient,
        uint256 amount,
        uint256 upVotes,
        uint256 downVotes,
        bool decision
    );

    constructor() {
        contractDeployer = msg.sender;
    }

    function createProposal(
        string calldata proposalTitle,
        string calldata proposalDescription,
        address recipientAddress,
        uint256 requestedAmount
    ) external onlyStakeholder("Only stakeholders can create proposals") returns (Proposal memory) {
        uint256 proposalID = totalProposals++;
        Proposal storage newProposal = proposals[proposalID];
        newProposal.id = proposalID;
        newProposal.requestedAmount = requestedAmount;
        newProposal.title = proposalTitle;
        newProposal.description = proposalDescription;
        newProposal.recipient = payable(recipientAddress);
        newProposal.votingDeadline = block.timestamp + MIN_VOTE_DURATION;

        emit ProposalEvent(msg.sender, ROLE_STAKEHOLDER, "Proposal Created", recipientAddress, requestedAmount);
        return newProposal;
    }

    function voteOnProposal(uint256 proposalID, bool decision) 
        external 
        onlyStakeholder("Only stakeholders can vote") 
        returns (Vote memory) 
    {
        Proposal storage proposal = proposals[proposalID];
        validateVote(proposal);
        if (decision) proposal.upVotes++;
        else proposal.downVotes++;

        votesByStakeholder[msg.sender].push(proposalID);
        votesForProposal[proposalID].push(Vote(msg.sender, block.timestamp, decision));

        emit VoteEvent(
            msg.sender,
            ROLE_STAKEHOLDER,
            "Proposal Voted",
            proposal.recipient,
            proposal.requestedAmount,
            proposal.upVotes,
            proposal.downVotes,
            decision
        );

        return Vote(msg.sender, block.timestamp, decision);
    }

    function validateVote(Proposal storage proposal) private {
        require(block.timestamp <= proposal.votingDeadline, "Voting period has ended");
        require(!proposal.approved, "Proposal already approved");

        uint256[] memory stakeholderVotes = votesByStakeholder[msg.sender];
        for (uint256 i = 0; i < stakeholderVotes.length; i++) {
            require(stakeholderVotes[i] != proposal.id, "Duplicate voting is not allowed");
        }
    }

    function executePayment(uint256 proposalID) 
        external 
        onlyStakeholder("Only stakeholders can execute payments") 
        onlyDeployer("Only the deployer can execute payments") 
        nonReentrant 
        returns (uint256) 
    {
        Proposal storage proposal = proposals[proposalID];
        require(contractBalance >= proposal.requestedAmount, "Insufficient contract balance");
        require(!proposal.fundsPaid, "Funds already paid");
        require(proposal.upVotes > proposal.downVotes, "Proposal not approved");

        transferFunds(proposal.requestedAmount, proposal.recipient);
        proposal.fundsPaid = true;
        proposal.executor = msg.sender;
        contractBalance -= proposal.requestedAmount;

        emit ProposalEvent(
            msg.sender,
            ROLE_STAKEHOLDER,
            "Payment Executed",
            proposal.recipient,
            proposal.requestedAmount
        );

        return contractBalance;
    }

    function transferFunds(uint256 amount, address payable recipient) private returns (bool) {
        (bool success,) = recipient.call{value: amount}("");
        require(success, "Fund transfer failed");
        return success;
    }

    function contribute() external payable returns (uint256) {
        require(msg.value > 0, "Contribution must be greater than zero");

        if (!hasRole(ROLE_STAKEHOLDER, msg.sender)) {
            uint256 newTotalContribution = contributorAmounts[msg.sender] + msg.value;
            if (newTotalContribution >= MIN_CONTRIBUTION) {
                stakeholderAmounts[msg.sender] = newTotalContribution;
                _grantRole(ROLE_STAKEHOLDER, msg.sender);
                _grantRole(ROLE_COLLABORATOR, msg.sender);
            } else {
                contributorAmounts[msg.sender] = newTotalContribution;
                _grantRole(ROLE_COLLABORATOR, msg.sender);
            }
        } else {
            stakeholderAmounts[msg.sender] += msg.value;
            contributorAmounts[msg.sender] += msg.value;
        }

        contractBalance += msg.value;
        emit ProposalEvent(msg.sender, ROLE_STAKEHOLDER, "Contribution Received", address(this), msg.value);

        return contractBalance;
    }

    function getProposalByID(uint256 proposalID) external view returns (Proposal memory) {
        return proposals[proposalID];
    }

    function getAllProposals() external view returns (Proposal[] memory allProposals) {
        allProposals = new Proposal[](totalProposals);
        for (uint256 i = 0; i < totalProposals; i++) {
            allProposals[i] = proposals[i];
        }
    }

    function getVotesForProposal(uint256 proposalID) external view returns (Vote[] memory) {
        return votesForProposal[proposalID];
    }

    function getStakeholderVotes() 
        external 
        view 
        onlyStakeholder("Unauthorized access") 
        returns (uint256[] memory) 
    {
        return votesByStakeholder[msg.sender];
    }

    function getStakeholderBalance() 
        external 
        view 
        onlyStakeholder("Unauthorized access") 
        returns (uint256) 
    {
        return stakeholderAmounts[msg.sender];
    }

    function getContractBalance() external view returns (uint256) {
        return contractBalance;
    }

    function isStakeholder() external view returns (bool) {
        return stakeholderAmounts[msg.sender] > 0;
    }

    function isContributor() external view returns (bool) {
        return contributorAmounts[msg.sender] > 0;
    }

    function getContributorBalance() 
        external 
        view 
        onlyContributor("Unauthorized access") 
        returns (uint256) 
    {
        return contributorAmounts[msg.sender];
    }

    function getDeployer() external view returns (address) {
        return contractDeployer;
    }
}
