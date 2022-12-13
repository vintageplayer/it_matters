const { ethers, userConfig } = require("hardhat");
const fs = require('fs');
const hre = require('hardhat');


async function deployContract(contractName, bridgeAddress) {
  const contractDeployInstance = await ethers.getContractFactory(contractName);
  const contract = await contractDeployInstance.deploy(
    bridgeAddress
  );
  await contract.deployed();
  return contract.address;
}

async function main() {
  // const bridgeAddress = "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C";

  // Read the network specific config  
  const network_name = hre.network.name;
  let config = JSON.parse(fs.readFileSync("./xdapp.config.json").toString());
  let network = config.networks[network_name];
  const bridgeAddress = network.bridgeAddress;
  let contractAddress;
  // Deploy the contracts
  if (network.contractType == "main") {
    contractAddress = await deployContract("AnyChainDAO", bridgeAddress);
    console.log(`Main Contract deployed to: ${contractAddress}`);
  }  else if (network.contractType == "side") {
    contractAddress = await deployContract("SideChainDAO", bridgeAddress);
    console.log(`Side contract deployed to: ${contractAddress}`);
  }

  network.deployedAddress = contractAddress;
  network.emittedVAAs = []
  config.networks[network_name] = network;
  fs.writeFileSync("./xdapp.config.json", JSON.stringify(config, null, 4));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });