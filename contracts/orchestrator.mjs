import fs from "fs";
import { ethers } from "ethers";
import {
    getEmitterAddressEth,
    parseSequenceFromLogEth,
} from "@certusone/wormhole-sdk";
import fetch from "node-fetch";

import * as dotenv from 'dotenv';
dotenv.config();

function getSigner(network) {
    const signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY).connect(
        new ethers.providers.JsonRpcProvider(network.rpc)
    );
    return signer;
}

function getContractAbi(contractType) {
    let contractArtifactFile;
    if (contractType == "main") {
        contractArtifactFile = "./artifacts/contracts/AnyChainDAO.sol/AnyChainDAO.json";
    } else {
        contractArtifactFile = "./artifacts/contracts/SideChainDAO.sol/SideChainDAO.json";
    }
    const abi = JSON.parse(fs.readFileSync(contractArtifactFile).toString()).abi;
    return abi;
}

async function registerDaoContract(network, targetNetwork) {
    const emitterAddr = Buffer.from(getEmitterAddressEth(targetNetwork.deployedAddress), "hex");
    const signer = getSigner(network);

    const daoContract = new ethers.Contract(
        network.deployedAddress,
        getContractAbi(network.contractType),
        signer
    );
    const tx = await daoContract.registerDaoContracts(
        targetNetwork.wormholeChainId,
        emitterAddr
    );
}

async function createProposal(network, proposalTitle) {
    const signer = getSigner(network);
    const daoContract = new ethers.Contract(
        network.deployedAddress,
        getContractAbi(network.contractType),
        signer
    );
    const tx = await (await daoContract.createProposal(proposalTitle)).wait();
    await new Promise((r) => setTimeout(r, 5000));
    const seq = parseSequenceFromLogEth(tx, network.bridgeAddress);
    return seq;
}

async function getVaaBytes(wormhole_address, chainId, emitterAddress, seq) {
    const vaaBytes = await (
        await fetch(`${wormhole_address}/v1/signed_vaa/${chainId}/${emitterAddress}/${seq}`)
    ).json();
    return vaaBytes;
}

async function submitMessage(network, vaaBytes) {
    const signer = getSigner(network);
    const daoContract = new ethers.Contract(
        network.deployedAddress,
        getContractAbi(network.contractType),
        signer
    );
    const tx = await daoContract.receiveEncodedMsg(Buffer.from(vaaBytes, "base64"));
    return tx;
}

async function voteOnProposal(network, proposalIndex, selected_vote) {
    const signer = getSigner(network);

    const daoContract = new ethers.Contract(
        network.deployedAddress,
        getContractAbi(network.contractType),
        signer
    );
    const tx = await daoContract.voteOnProposal(
        proposalIndex,
        selected_vote
    );
}

async function endVotingPeriod(network, proposalIndex) {
    const signer = getSigner(network);
    const daoContract = new ethers.Contract(
        network.deployedAddress,
        getContractAbi(network.contractType),
        signer
    );
    const tx = await (await daoContract.endVoting(proposalIndex)).wait();
    await new Promise((r) => setTimeout(r, 5000));
    const seq = parseSequenceFromLogEth(tx, network.bridgeAddress);
    return seq;
}

async function executeProposal(network, proposalIndex) {
    const signer = getSigner(network);
    const daoContract = new ethers.Contract(
        network.deployedAddress,
        getContractAbi(network.contractType),
        signer
    );
    const tx = await (await daoContract.executeProposal(proposalIndex)).wait();
    await new Promise((r) => setTimeout(r, 5000));
    const seq = parseSequenceFromLogEth(tx, network.bridgeAddress);
    return seq;
}

async function main() {
    let config = JSON.parse(fs.readFileSync("./xdapp.config.json").toString());

    let network = config.networks[process.argv[2]];
    if (!network) {
        throw new Error("Network not defined in config file.");
    }

    if (process.argv[3] == "deploy") {
        //
    } else if (process.argv[3] == "register_chain") {
        if (!network.deployedAddress) {
            throw new Error("Deploy to this network first!");
        }

        const targetNetwork = config.networks[process.argv[4]];
        if (!targetNetwork.deployedAddress) {
            throw new Error("Target Network not deployed yet!");
        }
        await registerDaoContract(network, targetNetwork);

        console.log(
            `Network(${process.argv[2]}) Registered Emitter: ${targetNetwork.deployedAddress} from Chain: ${process.argv[4]}`
        );
    } else if (process.argv[3] == "create_proposal") {
        if (!network.deployedAddress) {
            throw new Error("Deploy to this network first!");
        }

        if (network.contractType != "main") {
            throw new Error("Only Main Contracts Can create proposals!");
        }

        const proposalTitle = process.argv[4];
        const seq = await createProposal(network, proposalTitle);
        const emitterAddress = getEmitterAddressEth(network.deployedAddress);
        const vaaBytes = await getVaaBytes(config.wormhole.restAddress, network.wormholeChainId, emitterAddress, seq);

        if (!network.emittedVAAs) {
            network.emittedVAAs = [vaaBytes.vaaBytes];
        } else {
            network.emittedVAAs.push(vaaBytes.vaaBytes);
        }
        config.networks[process.argv[2]] = network;
        fs.writeFileSync(
            "./xdapp.config.json",
            JSON.stringify(config, null, 2)
        );
        console.log(
            `Network(${process.argv[2]}) Emitted VAA: `,
            vaaBytes.vaaBytes
        );
    } else if (process.argv[3] == "submit_vaa") {
        if (!network.deployedAddress) {
            throw new Error("Deploy to this network first!");
        }
        const targetNetwork = config.networks[process.argv[4]];
        const vaaBytes = isNaN(parseInt(process.argv[5]))
            ? targetNetwork.emittedVAAs.pop()
            : targetNetwork.emittedVAAs[parseInt(process.argv[5])];

        const tx = await submitMessage(network, vaaBytes);
        console.log(`Submitted VAA: ${vaaBytes}\nTX: ${tx.hash}`);
    } else if (process.argv[3] == "cast_vote") {
        if (!network.deployedAddress) {
            throw new Error("Deploy to this network first!");
        }

        const proposalIndex = process.argv[4];
        const selected_vote = process.argv[5];
        await voteOnProposal(network, proposalIndex, selected_vote);
        console.log(`Voted ${selected_vote} for propsal ${proposalIndex} on chain ${process.argv[2]}`);
    } else if (process.argv[3] == "end_voting") {
        if (!network.deployedAddress) {
            throw new Error("Deploy to this network first!");
        }

        if (network.contractType != "main") {
            throw new Error("Only Main Contracts Can create proposals!");
        }

        const proposalIndex = process.argv[4];
        const seq = await endVotingPeriod(network, proposalIndex);
        const emitterAddress = getEmitterAddressEth(network.deployedAddress);
        const vaaBytes = await getVaaBytes(config.wormhole.restAddress, network.wormholeChainId, emitterAddress, seq);

        if (!network.emittedVAAs) {
            network.emittedVAAs = [vaaBytes.vaaBytes];
        } else {
            network.emittedVAAs.push(vaaBytes.vaaBytes);
        }
        config.networks[process.argv[2]] = network;
        fs.writeFileSync(
            "./xdapp.config.json",
            JSON.stringify(config, null, 2)
        );
        console.log(
            `Network(${process.argv[2]}) Emitted VAA: `,
            vaaBytes.vaaBytes
        );
    } else if (process.argv[3] == "submit_end_of_voting") {
        if (!network.deployedAddress) {
            throw new Error("Deploy to this network first!");
        }
        const targetNetwork = config.networks[process.argv[4]];
        const vaaBytes = isNaN(parseInt(process.argv[5]))
            ? targetNetwork.emittedVAAs.pop()
            : targetNetwork.emittedVAAs[parseInt(process.argv[5])];

        const tx = await(await submitMessage(network, vaaBytes)).wait();
        console.log(`Submitted VAA: ${vaaBytes}\nTX: ${tx.hash}`);
        await new Promise((r) => setTimeout(r, 5000));
        console.log(network.bridgeAddress);
        const seq = parseSequenceFromLogEth(tx, network.bridgeAddress);

        const emitterAddress = getEmitterAddressEth(network.deployedAddress);
        const returnVaaBytes = await getVaaBytes(config.wormhole.restAddress, network.wormholeChainId, emitterAddress, seq);

        if (!network.emittedVAAs) {
            network.emittedVAAs = [returnVaaBytes.vaaBytes];
        } else {
            network.emittedVAAs.push(returnVaaBytes.vaaBytes);
        }
        config.networks[process.argv[2]] = network;
        fs.writeFileSync(
            "./xdapp.config.json",
            JSON.stringify(config, null, 2)
        );
        console.log(
            `Network(${process.argv[2]}) Emitted VAA: `,
            returnVaaBytes.vaaBytes
        );

    } else if (process.argv[3] == "execute_proposal") {
        if (!network.deployedAddress) {
            throw new Error("Deploy to this network first!");
        }

        if (network.contractType != "main") {
            throw new Error("Only Main Contracts Can create proposals!");
        }

        const proposalIndex = process.argv[4];
        const seq = await executeProposal(network, proposalIndex);
        const emitterAddress = getEmitterAddressEth(network.deployedAddress);
        const vaaBytes = await getVaaBytes(config.wormhole.restAddress, network.wormholeChainId, emitterAddress, seq);

        if (!network.emittedVAAs) {
            network.emittedVAAs = [vaaBytes.vaaBytes];
        } else {
            network.emittedVAAs.push(vaaBytes.vaaBytes);
        }
        config.networks[process.argv[2]] = network;
        fs.writeFileSync(
            "./xdapp.config.json",
            JSON.stringify(config, null, 2)
        );
        console.log(
            `Network(${process.argv[2]}) Emitted VAA: `,
            vaaBytes.vaaBytes
        );
    } else {
        throw new Error("Unkown command!");
    }
}

main();