require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL;
const AVAXFUJI_RPC_URL = process.env.AVAXFUJI_RPC_URL;
const MOONBASE_ALPHA_RPC_URL = process.env.MOONBASE_ALPHA_RPC_URL;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli_side: {
      url: GOERLI_RPC_URL,
      accounts: [WALLET_PRIVATE_KEY],
    },
    polygon_mumbai_side: {
      url: POLYGON_MUMBAI_RPC_URL,
      accounts: [WALLET_PRIVATE_KEY],
    },
    avaxfuji_main: {
      url: AVAXFUJI_RPC_URL,
      accounts: [WALLET_PRIVATE_KEY],
    },
    avaxfuji_side: {
      url: AVAXFUJI_RPC_URL,
      accounts: [WALLET_PRIVATE_KEY],
    },
    moonalpha_side: {
      url: MOONBASE_ALPHA_RPC_URL,
      accounts: [WALLET_PRIVATE_KEY],
    },
  },
};