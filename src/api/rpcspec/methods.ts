import {
  ADDRESS,
  BLOCK_ID,
  BLOCK_NUMBER,
  BROADCASTED_DECLARE_TXN,
  BROADCASTED_DEPLOY_ACCOUNT_TXN,
  // BROADCASTED_INVOKE_TXN,
  BROADCASTED_TXN,
  CHAIN_ID,
  EVENT_FILTER,
  FELT,
  FUNCTION_CALL,
  MSG_FROM_L1,
  PENDING_STATE_UPDATE,
  RESULT_PAGE_REQUEST,
  SIMULATION_FLAG,
  STATE_UPDATE,
  STORAGE_KEY,
  TXN_HASH,
} from "./components";

const blockId = {
  placeholder: "latest",
  index: 0,
  description:
    "The hash of the requested block, or number (height) of the requested block, or a block tag",
  oneOf: [
    { name: "block_tag", enum: ["latest", "pending"], placeholder: "latest" },
    {
      name: "block_hash",
      pattern: "0x[0-9a-fA-F]{64}",
      placeholder:
        "0x1926fe58c6750d786c352d448f3318e675ab1e866a9a728c66fa873675eb9fd",
    },
    { name: "block_number", pattern: "[0-9]+", placeholder: 474703 },
  ],
};

const contract_address = {
  placeholder:
    "0x124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
  description: "The address of the contract",
};

const transaction_hash = {
  placeholder:
    "0x7641514f46a77013e80215cdce2e55d5aca49c13428b885c7ecb9d3ddb4ab11",
  description: "The hash of the requested transaction",
};

const entry_point_selector = {};

const functionCall = {
  contract_address,
  entry_point_selector,
  // calldata: FELT[];
};

export const INVOKE_TXN_V0 = {
  type: "INVOKE",
  max_fee: "FELT",
  version: "0x0",
  signature: "SIGNATURE",
  contract_address,
  entry_point_selector,
  calldata: "FELT[]",
};

export const INVOKE_TXN_V1 = {
  type: "INVOKE",
  sender_address: "ADDRESS",
  calldata: "FELT[]",
  max_fee: "FELT",
  version: "NUM_AS_HEX",
  signature: "SIGNATURE",
  nonce: "FELT",
};

export const BROADCASTED_INVOKE_TXN = INVOKE_TXN_V0 || INVOKE_TXN_V1;

const ReadMethods = [
  // Returns the version of the Starknet JSON-RPC specification being used
  {
    name: "starknet_specVersion",
    params: [],
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getSpecVersion().then(specVersion => {
    console.log(specVersion);
});
    `,
  },

  // Get block information with transaction hashes given the block id
  {
    name: "starknet_getBlockWithTxHashes",
    params: {
      blockId: blockId,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getBlockWithTxHashes("latest").then(block => {
  console.log(block);
});
    `,
  },

  // Get block information with full transactions given the block id
  {
    name: "starknet_getBlockWithTxs",
    params: {
      blockId: blockId,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getBlockWithTxs("latest").then(block => {
  console.log(block);
});
    `,
  },

  // Get the information about the result of executing the requested block
  {
    name: "starknet_getStateUpdate",
    params: {
      blockId: blockId,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getBlockStateUpdate("latest").then(stateUpdate => {
    console.log(stateUpdate);
});
    `,
  },

  // Get the value of the storage at the given address and key
  {
    name: "starknet_getStorageAt",
    params: {
      contract_address,
      key: {
        placeholder:
          "0x1001e85047571380eed1d7e1cc5a9af6a707b3d65789bb1702c7d680e5e87e",
        description: "The key to the storage value for the given contract",
      },
      blockId,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getStorageAt("0x124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49", "0x1001e85047571380eed1d7e1cc5a9af6a707b3d65789bb1702c7d680e5e87e", "latest").then(storage => {
    console.log(storage);
});
    `,
  },

  // Gets the transaction status (possibly reflecting that the tx is still in the mempool, or dropped from it)
  {
    name: "starknet_getTransactionStatus",
    params: {
      transaction_hash,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getTransactionStatus("0x7641514f46a77013e80215cdce2e55d5aca49c13428b885c7ecb9d3ddb4ab11").then(transactionStatus => {
    console.log(transactionStatus);
});
    `,
  },

  // Get the details and status of a submitted transaction
  {
    name: "starknet_getTransactionByHash",
    params: {
      transaction_hash,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getTransactionByHash("0x7641514f46a77013e80215cdce2e55d5aca49c13428b885c7ecb9d3ddb4ab11").then(transaction => {
  console.log(transaction);
});
    `,
  },

  // Get the details of a transaction by a given block id and index
  {
    name: "starknet_getTransactionByBlockIdAndIndex",
    params: {
      blockId,
      index: {
        placeholder: 0,
        description: "The index of the transaction in the block",
      },
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
  const { RpcProvider } = require('starknet');
  
  const provider = new RpcProvider({
      nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
  })
  
  provider.getTransactionByBlockIdAndIndex("latest", 0).then(transaction => {
    console.log(transaction);
  });
      `,
  },

  // Get the transaction receipt by the transaction hash
  {
    name: "starknet_getTransactionReceipt",
    params: {
      transaction_hash,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
  const { RpcProvider } = require('starknet');
  
  const provider = new RpcProvider({
      nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
  })
  
  provider.getTransactionReceipt("0x7641514f46a77013e80215cdce2e55d5aca49c13428b885c7ecb9d3ddb4ab11").then(transactionReceipt => {
    console.log(transactionReceipt);
  });
      `,
  },

  // Get the contract class definition in the given block associated with the given hash
  {
    name: "starknet_getClass",
    params: {
      blockId,
      class_hash: {
        placeholder:
          "0x07fc0b6ecc96a698cdac8c4ae447816d73bffdd9603faacffc0a8047149d02ed",
        description: "The hash of the contract class",
      },
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getClass("latest", "0x07fc0b6ecc96a698cdac8c4ae447816d73bffdd9603faacffc0a8047149d02ed").then(class => {
    console.log(class);
});
    `,
  },

  // Get the contract class hash in the given block for the contract deployed at the given address
  {
    name: "starknet_getClassHashAt",
    params: {
      blockId,
      contract_address,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getClassHashAt("latest", "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7").then(classHash => {
    console.log(classHash);
});
    `,
  },

  // Get the contract class definition in the given block at the given address
  {
    name: "starknet_getClassAt",
    params: {
      blockId,
      contract_address,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getClassAt("latest", "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7").then(class => {
    console.log(class);
});
    `,
  },

  // Get the number of transactions in a block given a block id
  {
    name: "starknet_getBlockTransactionCount",
    params: {
      blockId: blockId,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getBlockTransactionCount("latest").then(transactionCount => {
    console.log(transactionCount);
});
    `,
  },

  // Call a StarkNet function without creating a StarkNet transaction
  {
    name: "starknet_call",
    params: {
      request: "FUNCTION_CALL",
      blockId,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
    const { RpcProvider } = require('starknet');
    
    const provider = new RpcProvider({
        nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
    })
    
    provider.getSpecVersion().then(specVersion => {
        console.log(specVersion);
    });
    `,
  },

  // Estimate the fee for StarkNet transactions
  {
    name: "starknet_estimateFee",
    params: {
      request: "BROADCASTED_TXN[]", //TODO:
      blockId,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
    const { RpcProvider } = require('starknet');
    
    const provider = new RpcProvider({
        nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
    })
    
    provider.getSpecVersion().then(specVersion => {
        console.log(specVersion);
    });
    `,
  },

  // Estimate the L2 fee of a message sent on L1
  {
    name: "starknet_estimateMessageFee",
    params: {
      message: "MSG_FROM_L1",
      blockId,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getSpecVersion().then(specVersion => {
    console.log(specVersion);
});
    `,
  },

  // Get the most recent accepted block number
  {
    name: "starknet_blockNumber",
    params: [],
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getBlockNumber().then(blockNumber => {
    console.log(blockNumber);
});
    `,
  },

  // Get the most recent accepted block hash and number
  {
    name: "starknet_blockHashAndNumber",
    params: [],
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getBlockLatestAccepted().then(blockHashAndNumber => {
    console.log(blockHashAndNumber);
});
    `,
  },

  // Return the currently configured StarkNet chain id
  {
    name: "starknet_chainId",
    params: [],
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getChainId().then(chainId => {
    console.log(chainId);
});
    `,
  },

  // Returns an object about the sync status, or false if the node is not syncing
  {
    name: "starknet_syncing",
    params: [],
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getSyncingStats().then(syncing => {
    console.log(syncing);
});
    `,
  },

  // Returns all events matching the given filter
  {
    name: "starknet_getEvents",
    params: {
      filter: {
        from_block: blockId,
        to_block: blockId,
        address: contract_address,
        keys: {
          placeholder:
            "0x1001e85047571380eed1d7e1cc5a9af6a707b3d65789bb1702c7d680e5e87e",
          description: "The key to the storage value for the given contract",
          type: "array",
        },
        continuation_token: {
          placeholder: "",
          description:
            "The token returned from the previous query. If no token is provided the first page is returned",
        },
        chunk_size: {
          placeholder: 2,
        },
      },
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider
  .getEvents({
    from_block: { block_number: 0 },
    to_block: "latest",
    address:
      "0x124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
    keys: [
      ["0x1001e85047571380eed1d7e1cc5a9af6a707b3d65789bb1702c7d680e5e87e"],
    ],
    chunk_size: 2,
  })
  .then((events: any) => {
    console.log(events);
  });
    `,
  },

  // Get the nonce associated with the given address in the given block
  {
    name: "starknet_getNonce",
    params: {
      blockId,
      contract_address,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getNonceForAddress("latest", "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7").then(nonce => {
    console.log(nonce);
});
    `,
  },
];

const WriteMethods = [
  // Submit a new transaction to be added to the chain
  {
    name: "starknet_addInvokeTransaction",
    params: BROADCASTED_INVOKE_TXN,
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getSpecVersion().then(specVersion => {
    console.log(specVersion);
});
    `,
  },

  // Submit a new class declaration transaction
  {
    name: "starknet_addDeclareTransaction",
    params: {
      declare_transaction: "BROADCASTED_DECLARE_TXN",
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getSpecVersion().then(specVersion => {
    console.log(specVersion);
});
    `,
  },

  // Submit a new deploy account transaction
  {
    name: "starknet_addDeployAccountTransaction",
    params: {
      deploy_account_transaction: "BROADCASTED_DEPLOY_ACCOUNT_TXN",
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getSpecVersion().then(specVersion => {
    console.log(specVersion);
});
    `,
  },
];

const TraceMethods = [
  // For a given executed transaction, return the trace of its execution, including internal calls
  {
    name: "starknet_traceTransaction",
    params: { transaction_hash },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getTransactionTrace("0x7641514f46a77013e80215cdce2e55d5aca49c13428b885c7ecb9d3ddb4ab11").then(transactionTrace => {
    console.log(transactionTrace);
});
    `,
  },

  // Returns the execution traces of all transactions included in the given block
  {
    name: "starknet_traceBlockTransactions",
    params: {
      blockId: blockId,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

provider.getBlockTransactionsTraces("latest").then(transactionTraces => {
    console.log(transactionTraces);
});
    `,
  },

  // Simulate a given sequence of transactions on the requested state, and generate the execution traces. If one of the transactions is reverted, raises CONTRACT_ERROR
  {
    name: "starknet_simulateTransactions",
    params: {
      blockId,
      transactions: Array<BROADCASTED_TXN>,
      simulation_flags: Array<SIMULATION_FLAG>,
    },
    starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
    const { RpcProvider } = require('starknet');
    
    const provider = new RpcProvider({
        nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
    })
    
    provider.getSpecVersion().then(specVersion => {
        console.log(specVersion);
    });
    `,
  },
];

export const Methods = [...ReadMethods, ...WriteMethods, ...TraceMethods];
