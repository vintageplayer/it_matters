require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const AVAXFUJI_RPC_URL = process.env.AVAXFUJI_RPC_URL;

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.17",
  networks: {
    avaxfuji_main: {
      url: AVAXFUJI_RPC_URL,
      accounts: [WALLET_PRIVATE_KEY],
    },
    avaxfuji_side: {
      url: AVAXFUJI_RPC_URL,
      accounts: [WALLET_PRIVATE_KEY],
    },
  },
};