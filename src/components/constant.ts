export const MAINNET_RPC_URL = "https://free-rpc.nethermind.io/mainnet-juno/";
export const GOERLI_RPC_URL = "https://free-rpc.nethermind.io/goerli-juno/";
export const SEPOLIA_RPC_URL = "https://free-rpc.nethermind.io/sepolia-juno/";
export const DEFAULT_STARKNET_JS_REQUEST = `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getSpecVersion().then(specVersion => {
    console.log(specVersion);
});
`;
export const DEFAULT_STARKNET_GO_REQUEST = `package main

import (
	"context"
	"fmt"
	"log"

	"github.com/NethermindEth/starknet.go/rpc"
)

func main() {
	rpcUrl := "https://free-rpc.nethermind.io/mainnet-juno/"

	client, err := rpc.NewClient(rpcUrl)
	if err != nil {
		log.Fatal(err)
	}

	provider := rpc.NewProvider(client)
	specVersion, err := provider.SpecVersion(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("SpecVersion:", specVersion)
}`;
export const DEFAULT_STARKNET_RS_REQUEST = ``;
export const CURL_HEADER = `--header 'Content-Type: application/json' \\`;
export const DEFAULT_CURL_REQUEST = `curl --location 'https://free-rpc.nethermind.io/mainnet-juno/' \\
${CURL_HEADER}
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
