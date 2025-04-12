require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

// Replace these with your own values
const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "YOUR_ALCHEMY_URL";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
      gas: 2100000,
      gasPrice: 8000000000
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
}; 