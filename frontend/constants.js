
export const CONTRACT_DETAILS = {
  43113: {
    "address": "0xf1756B65C076b52D935B4da1bb2525693a2d31A5",
    "contractType": "main",
    "wormholeChainId": 6,
    "bridgeAddress": "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C"
  },
  1287: {
    "address": "0xd4d3C026ec0E7e34A2f36b81cF4b92E875A37dE4",
    "contractType": "side",
    "wormholeChainId": 16,
    "bridgeAddress": "0xa5B7D85a8f27dd7907dc8FdC21FA5657D5E2F901"
  }
};

export const MAINCHAIN_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "wormhole_core_bridge_address",
        "type": "address"
      }
    ],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "proposalTitle",
        "type": "string"
      }
    ],
    "name": "createProposal",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalIndex",
        "type": "uint256"
      }
    ],
    "name": "endVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalIndex",
        "type": "uint256"
      }
    ],
    "name": "executeProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "numProposals",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "proposals",
    "outputs": [
      {
        "internalType": "string",
        "name": "proposalTitle",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "inFavor",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "against",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "abstain",
            "type": "uint256"
          }
        ],
        "internalType": "struct AnyChainDAO.VoteCount",
        "name": "votes",
        "type": "tuple"
      },
      {
        "internalType": "bool",
        "name": "votingEnded",
        "type": "bool"
      },
      {
        "internalType": "uint32",
        "name": "siblingVoteReceivedCount",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "executed",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "proposalPassed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "encodedMsg",
        "type": "bytes"
      }
    ],
    "name": "receiveEncodedMsg",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "chainId",
        "type": "uint16"
      },
      {
        "internalType": "bytes32",
        "name": "daoContractAddress",
        "type": "bytes32"
      }
    ],
    "name": "registerDaoContracts",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalIndex",
        "type": "uint256"
      },
      {
        "internalType": "enum AnyChainDAO.Vote",
        "name": "vote",
        "type": "uint8"
      }
    ],
    "name": "voteOnProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawEther",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

export const SIDECHAIN_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "wormhole_core_bridge_address",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "proposals",
    "outputs": [
      {
        "internalType": "string",
        "name": "proposalTitle",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "inFavor",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "against",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "abstain",
            "type": "uint256"
          }
        ],
        "internalType": "struct SideChainDAO.VoteCount",
        "name": "votes",
        "type": "tuple"
      },
      {
        "internalType": "bool",
        "name": "votingEnded",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "executed",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "proposalPassed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "encodedMsg",
        "type": "bytes"
      }
    ],
    "name": "receiveEncodedMsg",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "chainId",
        "type": "uint16"
      },
      {
        "internalType": "bytes32",
        "name": "daoContractAddress",
        "type": "bytes32"
      }
    ],
    "name": "registerDaoContracts",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalIndex",
        "type": "uint256"
      },
      {
        "internalType": "enum SideChainDAO.Vote",
        "name": "vote",
        "type": "uint8"
      }
    ],
    "name": "voteOnProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];