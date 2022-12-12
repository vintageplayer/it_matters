// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Wormhole/IWormhole.sol";

// We will add the Interfaces here

contract AnyChainDAO is Ownable {
    
    // Variables needed for cross-chain messaging using wormhole
    IWormhole core_bridge;
    uint32 nonce = 0;
    mapping(uint16 => bytes32) _daoContracts;
    mapping(bytes32 => bool) _completedMessages;

    // Create an enum named Vote containing possible options for a vote
    enum Vote {
        YES, // YES = 0
        NO, // NO = 1
        ABSTAIN // ABSTAIN = 2
    }

    enum MessageOperation {
        NEW_PROPOSAL,
        VOTING_ENDED,
        SHARING_VOTES,
        PROPOSAL_RESULT
    }
    
    // Create a struct named votes to store counts for a proposal
    struct VoteCount {
        // inFavor - number of yes votes for this proposal
        uint256 inFavor;
        // against - number of no votes for this proposal
        uint256 against;
        // abstain - number of neutral votes for this proposal
        uint256 abstain;
    }

    // Create a struct named Proposal containing all relevant information
    struct Proposal {
        // proposalTitle - The purpose of the proposal (Here represents the action to take afterwards)
        string proposalTitle;
        // deadline - the UNIX timestamp until which this proposal is active. Proposal can be executed after the deadline has been exceeded.
        uint256 deadline;
        // votes - Count of different votes cast on-chain for the proposal
        VoteCount votes;
        // votingEnded - whether or not the voting period has ended and chains have been notified
        bool votingEnded;
        // siblingVoteReceivedCount - number of chains from which final vote counts have been added
        uint32 siblingVoteReceivedCount;
        // executed - whether or not this proposal has been executed yet. Cannot be executed before the deadline has been exceeded.
        bool executed;
        // proposalPassed - whether the voting outcome was in favor of the proposal or not
        bool proposalPassed;
        // voters - a mapping of addresses to booleans indicating whether the address has already been used to cast a vote or not
        mapping(address => bool) voters;
    }

    // Create a mapping of ID to Proposal
    mapping(uint256 => Proposal) public proposals;

    // Number of proposals that have been created
    uint256 public numProposals;

    // Create a payable constructor to store treasuryfunds and use it for executing proposals
    // The payable allows this constructor to accept an ETH deposit when it is being deployed
    constructor(address wormhole_core_bridge_address) payable {        
        core_bridge = IWormhole(wormhole_core_bridge_address);
    }

    // Create a modifier which only allows a function to be
    // called by someone who has voting power through tokens or delegation
    modifier votingRightHolderOnly() {
        // Check for address having voting rights
        _;
    }

    // Create a modifier which only allows a function to be
    // called if the given proposal's deadline has not been exceeded yet
    modifier activeProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline > block.timestamp,
            "DEADLINE_EXCEEDED"
        );
        _;
    }

    // Create a modifier which only allows a function to be
    // called if the given proposals' deadline HAS been exceeded
    // and if the proposal has not yet been executed
    modifier readyToExecuteOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline <= block.timestamp,
            "DEADLINE_NOT_EXCEEDED"
        );
        require(
            proposals[proposalIndex].executed == false,
            "PROPOSAL_ALREADY_EXECUTED"
        );
        _;
    }

    // Registers it's DAO contracts on other chains as the only ones that can send this instance messages
    function registerDaoContracts(uint16 chainId, bytes32 daoContractAddress) public onlyOwner {
        _daoContracts[chainId] = daoContractAddress;
    }

    function sendMessage(MessageOperation operation, uint256 proposalIndex) internal returns (uint64 sequence) {
        bytes memory str = createMessagePayload(operation, proposalIndex);
        sequence = core_bridge.publishMessage(nonce, str, 1);
        nonce = nonce+1;
    }

    /// @dev createMessagePayload converts the operation type and proposal state to bytes to emit to the bridge contract
    function createMessagePayload(MessageOperation operation, uint256 proposalIndex)
    internal view returns (bytes memory) {
        return abi.encode(operation,
            proposalIndex,
            proposals[proposalIndex].proposalTitle,
            proposals[proposalIndex].deadline,
            proposals[proposalIndex].votes,
            proposals[proposalIndex].executed,
            proposals[proposalIndex].proposalPassed
            );
    }

    /// @dev processMessagePayload processes messages received from other chain
    function processMessagePayload(bytes memory data)
    internal {
        MessageOperation operation;
        uint256 proposalIndex;
        string memory proposalTitle;
        uint256 deadline;
        VoteCount memory votes;
        bool executed;
        bool proposalPassed;
        (operation, proposalIndex, proposalTitle, deadline, votes, executed, proposalPassed) = abi.decode(data, (MessageOperation, uint256, string, uint256, VoteCount, bool, bool));
    }


    function receiveEncodedMsg(bytes memory encodedMsg) public {
        (IWormhole.VM memory vm, bool valid, string memory reason) = core_bridge.parseAndVerifyVM(encodedMsg);
        
        //1. Check Wormhole Guardian Signatures
        //  If the VM is NOT valid, will return the reason it's not valid
        //  If the VM IS valid, reason will be blank
        require(valid, reason);

        //2. Check if the Emitter Chain contract is registered
        require(_daoContracts[vm.emitterChainId] == vm.emitterAddress, "Invalid Emitter Address!");
    
        //3. Check that the message hasn't already been processed
        require(!_completedMessages[vm.hash], "Message already processed");
        _completedMessages[vm.hash] = true;

        //Process the Message
        processMessagePayload(vm.payload);
    }

    /// @dev createProposal allows a AnyChainDAO voting rights holder to create a new proposal in the DAO
    /// @param proposalTitle - The proposal to execute based on voting outcome
    /// @return Returns the proposal index for the newly created proposal
    function createProposal(string calldata proposalTitle)
        external
        votingRightHolderOnly
        returns (uint256)
    {
        Proposal storage proposal = proposals[numProposals];
        proposal.proposalTitle = proposalTitle;
        // Set the proposal's voting deadline to be (current time + 10 minutes)
        proposal.deadline = block.timestamp + 10 minutes;
        sendMessage(MessageOperation.NEW_PROPOSAL, numProposals);
        numProposals++;

        return numProposals - 1;
    }

    /// @dev voteOnProposal allows a voting right holder to cast their vote on an active proposal
    /// @param proposalIndex - the index of the proposal to vote on in the proposals array
    /// @param vote - the type of vote they want to cast
    function voteOnProposal(uint256 proposalIndex, Vote vote)
        external
        votingRightHolderOnly
        activeProposalOnly(proposalIndex)
    {
        require(proposals[proposalIndex].voters[msg.sender] == false, "ALREADY_VOTED");
        
        Proposal storage proposal = proposals[proposalIndex];

        if (vote == Vote.YES) {
            proposal.votes.inFavor += 1;
        } else if (vote == Vote.NO) {
            proposal.votes.against += 1;
        } else {
            proposal.votes.abstain += 1;
        }
    }

    /// @dev executeProposal allows any voting right holder to execute a proposal after it's deadline has been exceeded
    /// @param proposalIndex - the index of the proposal to execute in the proposals array
    function executeProposal(uint256 proposalIndex)
        external
        votingRightHolderOnly
        readyToExecuteOnly(proposalIndex)
    {
        Proposal storage proposal = proposals[proposalIndex];

        // If the proposal has more YES votes than NO votes
        // mark the outcome has success
        if (proposal.votes.inFavor > proposal.votes.against) {
            proposal.proposalPassed = true;
        }
        proposal.executed = true;
        sendMessage(MessageOperation.PROPOSAL_RESULT, proposalIndex);
    }

    /// @dev withdrawEther allows the contract owner (deployer) to withdraw the ETH from the contract
    function withdrawEther() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // The following two functions allow the contract to accept ETH deposits
    // directly from a wallet without calling a function
    receive() external payable {}

    fallback() external payable {}
}