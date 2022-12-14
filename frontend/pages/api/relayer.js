import { ethers } from "ethers";
import fetch from "node-fetch";
import {
  CONTRACT_ADDRESSES,
  MAINCHAIN_ABI,
  SIDECHAIN_ABI
} from "../../constants";
var network_config = require("../../xdapp.config.json");

function getSigner(network) {
    const signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY).connect(
        new ethers.providers.JsonRpcProvider(network.rpc)
    );
    return signer;
}

function getContractAbi(contractType) {
    if (contractType == "main") {
        return MAINCHAIN_ABI;
    } else {
        return SIDECHAIN_ABI;
    }
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

async function getVaaBytes(wormhole_address, chainId, emitterAddress, seq) {
  const vaaUrl = `${wormhole_address}/v1/signed_vaa/${chainId}/${emitterAddress}/${seq}`;
  console.log(vaaUrl);
  const vaaBytes = await (
    await fetch(vaaUrl)
  ).json();
  return vaaBytes.vaaBytes;
}

export default async function handler(req, res) {
  if (req.method != "POST") {
      res.status(400).json({ error: 'Only POST requests allowed' });
  }

  const payload = JSON.parse(req.body);
  const wormholeChainId = payload.wormholeChainId;
  const emitterAddress = payload.emitterAddress;
  const seq = payload.seq;
  const contractType = payload.contractType;
  const vaaBytes = await getVaaBytes(network_config.wormhole.restAddress, wormholeChainId, emitterAddress, seq);

  // Write the logic to get the correct network
  const network = contractType == "main" ? network_config.networks["side"] : network_config.networks["main"] ;
  const tx = await submitMessage(network, vaaBytes);
  res.status(200).json({"tx_hash":tx.hash});
}
