export const MAINNET_RPC_URL = "https://free-rpc.nethermind.io/mainnet-juno/";
export const GOERLI_RPC_URL = "https://free-rpc.nethermind.io/goerli-juno/";
export const SEPOLIA_RPC_URL = "https://free-rpc.nethermind.io/sepolia-juno/";
export const DEFAULT_STARKNET_JS_REQUEST = `// Installation Instructions: https://https://www.starknetjs.com/
const starknet = require('starknet');

const provider = new starknet.RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getSpecVersion().then(specVersion => {
    console.log(specVersion);
});
`;
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
