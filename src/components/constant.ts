export const MAINNET_RPC_URL = "https://free-rpc.nethermind.io/mainnet-juno/";
export const GOERLI_RPC_URL = "https://free-rpc.nethermind.io/goerli-juno/";
export const SEPOLIA_RPC_URL = "https://free-rpc.nethermind.io/sepolia-juno/";
export const DEFAULT_STARKNET_JS_REQUEST = `// Installation Instructions: https://docs.ethers.io/v5/getting-started
const { ethers } = require('ethers');

async function executeMethod() {
  // Initialize an ethers instance
  const provider = new ethers.providers.JsonRpcProvider('https://mainnet.gateway.tenderly.co/6MvoUVIsJd6Ab8SWACHep7');

  // Execute method
  const balance = await provider.getBalance('0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 'latest');

  // Print the output to console
  console.log(balance);
}

executeMethod();`;
export const DEFAULT_CURL_REQUEST = `curl --location 'https://free-rpc.nethermind.io/mainnet-juno/' \\
--data '{
    "jsonrpc":"2.0",
    "method":"starknet_specVersion",
    "id":1
}'`;
export const DEFAULT_RAW_REQUEST = `{
    "jsonrpc":"2.0",
    "method":"starknet_specVersion",
    "id":1
}`;
export const DEFAULT_RAW_RESPONSE = `{
    "jsonrpc": "2.0",
    "result": "0.6.0",
    "id": 1
  }`;
export const DEFAULT_DECODED_RESPONSE = `{
    "result": "0.6.0"
    }`;
