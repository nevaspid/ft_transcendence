//import { config as dotenvConfig } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

//dotenvConfig();

export default {
    solidity: "0.8.20",
    networks: {
        fuji: {
            url: "https://api.avax-test.network/ext/bc/C/rpc",
            chainId: 43113,
            accounts: /*[process.env.PRIVATE_KEY]*/ ['615a494a05d39f31ab22da99819a3b48914e993e2cf4a7a9d81d289f0ad6ff00'],
        },
    },
    defaultNetwork: 'fuji',
};
