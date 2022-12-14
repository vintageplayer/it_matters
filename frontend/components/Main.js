import { useAccount, useNetwork } from 'wagmi';
import { Contract, providers } from "ethers";
import { useEffect, useRef, useState } from "react";
import {
  CONTRACT_DETAILS,
  MAINCHAIN_ABI,
  SIDECHAIN_ABI
} from "../constants";
import {
    getEmitterAddressEth,
    parseSequenceFromLogEth,
} from "@certusone/wormhole-sdk";
import CreateProposalTab from "./CreateProposalTab";
import ViewProposalsTab from "./ViewProposalsTab";
import styles from "../styles/Home.module.css";

export default function Main() {
	const {connector, address} = useAccount();
	const { chain } = useNetwork()
	// Number of proposals created in the DAO
	const [numProposals, setNumProposals] = useState("0");
	// Array of all proposals created in the DAO
	const [proposals, setProposals] = useState([]);
	// User's Voting Power in the selected network in AnyChainDAO
	const [votingPower, setVotingPower] = useState(0);
	// Proposal Title To Execute. Used when creating a proposal.
	const [proposalTitle, setProposalTitle] = useState("");
	// One of "Create Proposal" or "View Proposals"
	const [selectedTab, setSelectedTab] = useState("");
	// True if waiting for a transaction to be mined, false otherwise.
	const [loading, setLoading] = useState(false);

	// Helper function to fetch a Provider/Signer instance from Metamask
	const getProviderOrSigner = async (needSigner = false) => {
		const provider = connector.options.getProvider();
		const web3Provider = new providers.Web3Provider(provider);
		const { chainId } = await web3Provider.getNetwork();
		if (Object.keys(CONTRACT_DETAILS).indexOf(chainId.toString()) === -1) {
		  window.alert("Not on a supported network! Please switch to the Avax Fuji or Moonbase Alpha network.");
		  throw new Error("Please switch to the Avax Fuji or Moonbase Alpha network");
		}

		if (needSigner) {
		  const signer = web3Provider.getSigner();
		  return signer;
		}
		return web3Provider;
	};

	// Helper function to return a DAO Contract instance
	// given a Provider/Signer
	const getDaoContractInstance = (providerOrSigner) => {
		return new Contract(
		  CONTRACT_DETAILS[chain.id]["address"],
		  MAINCHAIN_ABI,
		  providerOrSigner
		);
	};

	// Reads the number of proposals in the DAO contract and sets the `numProposals` state variable
	const getNumProposalsInDAO = async () => {
		try {
		  const provider = await getProviderOrSigner();
		  const contract = getDaoContractInstance(provider);
		  const daoNumProposals = await contract.numProposals();
		  setNumProposals(daoNumProposals.toString());
		} catch (error) {
		  console.error(error);
		}
	};

	// Fetches the Voting Power of the user in the selected network of AnyChainDAO and sets the `votingPower` state variable
	const getUserVotingPower = async () => {
		try {
		  setVotingPower(parseInt("1"));
		} catch (error) {
		  console.error(error);
		}
	};

	const submitToRelayer = async (tx, endVoting) => {
		const seq = parseSequenceFromLogEth(tx, CONTRACT_DETAILS[chain.id]["bridgeAddress"]);
		const payloadBody = JSON.stringify({
			wormholeChainId: CONTRACT_DETAILS[chain.id]["wormholeChainId"],
			emitterAddress: getEmitterAddressEth(CONTRACT_DETAILS[chain.id]["address"]),
			seq: seq,
			contractType: CONTRACT_DETAILS[chain.id]["contractType"]
		})
		const endPoint = (endVoting) ? '/api/endVotingRelayer' : '/api/relayer';
		let res = await fetch(endPoint, {
				method: 'POST',
				headers: {'Content-Type': 'application-json'},
				body: payloadBody
			});
		console.log(res);
	}

	// Calls the `createProposal` function in the contract, using the tokenId from `proposalTitle`
	const createProposal = async () => {
		try {
		  const signer = await getProviderOrSigner(true);
		  const daoContract = getDaoContractInstance(signer);
		  const txn = await daoContract.createProposal(proposalTitle);
		  console.log(txn);
		  setLoading(true);
		  try {
			  const tx = await txn.wait();
			  await new Promise((r) => setTimeout(r, 5000));
			  await getNumProposalsInDAO();
			  submitToRelayer(tx, false);
			 } catch (error) {
			 	console.error(error);
			 	window.alert(error);
			 }
		  setLoading(false);
		} catch (error) {
		  console.error(error);
		  window.alert(error.message);
		}
	};

	// Helper function to fetch and parse one proposal from the DAO contract
	// Given the Proposal ID
	// and converts the returned data into a Javascript object with values we can use
	const fetchProposalById = async (id) => {
		try {
		  const provider = await getProviderOrSigner();
		  const daoContract = getDaoContractInstance(provider);
		  const proposal = await daoContract.proposals(id);
		  const parsedProposal = {
		    proposalId: id,
		    proposalTitle: proposal.proposalTitle.toString(),
		    deadline: new Date(parseInt(proposal.deadline.toString()) * 1000),
		    inFavorVotes: proposal.votes.inFavor.toString(),
		    againstVotes: proposal.votes.against.toString(),
		    abstainVotes: proposal.votes.abstain.toString(),
		    votingEnded: proposal.votingEnded,
		    proposalPassed: proposal.proposalPassed,
		    executed: proposal.executed,
		  };
		  return parsedProposal;
		} catch (error) {
		  console.error(error);
		}
	};

	// Runs a loop `numProposals` times to fetch all proposals in the DAO
	// and sets the `proposals` state variable
	const fetchAllProposals = async () => {
		try {
		  const proposals = [];
		  for (let i = 0; i < numProposals; i++) {
		    const proposal = await fetchProposalById(i);
		    proposals.push(proposal);
		  }
		  setProposals(proposals);
		  return proposals;
		} catch (error) {
		  console.error(error);
		}
	};

	// Calls the `voteOnProposal` function in the contract, using the passed
	// proposal ID and Vote
	const voteOnProposal = async (proposalId, _vote) => {
		try {
		  const signer = await getProviderOrSigner(true);
		  const daoContract = getDaoContractInstance(signer);

		  let vote = _vote === "YES" ? 0 : (_vote === "NO" ? 1 : 2);
		  const txn = await daoContract.voteOnProposal(proposalId, vote);
		  setLoading(true);
		  try {
		  	await txn.wait();
		  } catch (error) {
			  console.error(error);
			  window.alert(error.message);
			}
		  setLoading(false);
		  await fetchAllProposals();
		} catch (error) {
		  console.error(error);
		  window.alert(error.message);
		}
	};

	// Calls the `endVoting` function in the contract, using the passed
	// proposal ID
	const endVoting = async (proposalId) => {
		try {
		  const signer = await getProviderOrSigner(true);
		  const daoContract = getDaoContractInstance(signer);

		  const txn = await daoContract.endVoting(proposalId);
		  setLoading(true);
		  try {
		  	const tx = await txn.wait();
		  	await new Promise((r) => setTimeout(r, 5000));
		  	submitToRelayer(tx, true);
		  } catch (error) {
			  console.error(error);
			  window.alert(error.message);
			}
		  setLoading(false);
		  await fetchAllProposals();
		} catch (error) {
		  console.error(error);
		  window.alert(error.message);
		}
	};

	// Calls the `executeProposal` function in the contract, using
	// the passed proposal ID
	const executeProposal = async (proposalId) => {
		try {
		  const signer = await getProviderOrSigner(true);
		  const daoContract = getDaoContractInstance(signer);
		  const txn = await daoContract.executeProposal(proposalId);
		  setLoading(true);
		  try {
		  	const tx = await txn.wait();
		  	await new Promise((r) => setTimeout(r, 5000));
		  	submitToRelayer(tx, false);
			} catch (error) {
			  console.error(error);
			  window.alert(error.message);
			}
		  setLoading(false);
		  await fetchAllProposals();
		} catch (error) {
		  console.error(error);
		  window.alert(error);
		}
	};


	function renderTabs() {
		if (selectedTab === "Create Proposal") {
			return <CreateProposalTab
				contractType={CONTRACT_DETAILS[chain.id]["contractType"]}
				loading={loading}
				votingPower={votingPower}
				styles={styles}
				setProposalTitle={setProposalTitle}
				createProposal={createProposal}
			/>
		} else if (selectedTab === "View Proposals") {
			return <ViewProposalsTab
				contractType={CONTRACT_DETAILS[chain.id]["contractType"]}
				loading={loading}
				styles={styles}
				proposals={proposals}
				voteOnProposal={voteOnProposal}
				endVoting={endVoting}
				executeProposal={executeProposal}
			/>
		}
		return null;
	}

	function clearState() {
		setSelectedTab("");
	}

	useEffect(() => {
		clearState();
		if (Object.keys(CONTRACT_DETAILS).indexOf(chain.id.toString()) === -1) {
		  window.alert("Not on a supported network! Please switch to the Avax Fuji or Moonbase Alpha network.");
		  console.error("Please switch to the Avax Fuji or Moonbase Alpha network");
		} else {
			getNumProposalsInDAO();
			getUserVotingPower();
		}
	}, [chain.id]);

	useEffect(() => {
		if (connector !== undefined){
			getNumProposalsInDAO();
			getUserVotingPower();
		}
	}, [connector]);
	
	// Piece of code that runs everytime the value of `selectedTab` changes
	// Used to re-fetch all proposals in the DAO when user switches
	// to the 'View Proposals' tab
	useEffect(() => {
		if (selectedTab === "View Proposals") {
		  fetchAllProposals();
		}
	}, [selectedTab]);

	return (
		<>
			<div className={styles.main}>
				<div>
          			<h1 className={styles.title}>Welcome to Cross-Chain Governance Voting!</h1>
          			<div className={styles.description}>Welcome to the AnyChain DAO!</div>
      				<div className={styles.description}>
      					Your addres: {address}
      					<br />
        				Your Voting Power: {votingPower}
        				<br />
        				Total Number of Proposals: {numProposals}
      				</div>
      				<div className={styles.flex}>
        				<button
          					className={styles.button}
      						onClick={() => setSelectedTab("Create Proposal")}
        				>
          					Create Proposal
        				</button>
        				<button
          					className={styles.button}
      						onClick={() => setSelectedTab("View Proposals")}
        				>
          					View Proposals
        				</button>
        			</div>
        			{renderTabs()}
  				</div>
      		</div>
			<footer className={styles.footer}>
				Made with &#10084; by vintageplayer
			</footer>
		</>
	)
}