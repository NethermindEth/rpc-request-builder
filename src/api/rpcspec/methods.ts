const STARKNET_JS_PREFIX = `// Installation Instructions: https://https://www.starknetjs.com/
const { RpcProvider } = require('starknet');

const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
})

`;

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

const l1_address = {
  placeholder: "0xc662c410c0ecf747543f5ba90660f6abebd9c8c4",
  description: "The address of the l1 contract sending the message",
};

const transaction_hash = {
  placeholder:
    "0x7641514f46a77013e80215cdce2e55d5aca49c13428b885c7ecb9d3ddb4ab11",
  description: "The hash of the requested transaction",
};

const entry_point_selector = {
  placeholder: "name",
  description: "The name of the function to call",
};
const calldata = {
  placeholder: [],
  description: "The calldata to send with the function call",
};

const functionCall = {
  contract_address,
  entry_point_selector,
  calldata,
};

const version = {
  placeholder: "0x0",
  description: "The version of the transaction",
};

const max_fee = {
  placeholder: "0x0",
  description: "The maximum fee the sender is willing to pay",
};

const signature = {
  placeholder: [
    "0x1d4231646034435917d3513cafd6e22ce3ca9a783357137e32b7f52827a9f98",
    "0x61c0b5bae9710c514817c772146dd7509517d2c47fd9bf622370215485ee5af",
  ],
};

export const INVOKE_TXN_V0 = {
  type: {
    placeholder: "INVOKE",
  },
  max_fee,
  version,
  signature,
  contract_address,
  entry_point_selector,
  calldata,
};

export const INVOKE_TXN_V1 = {
  type: {
    placeholder: "INVOKE",
  },
  sender_address: contract_address,
  calldata,
  max_fee,
  version,
  signature,
  nonce: {
    placeholder: "0x0",
  },
};

export const BROADCASTED_INVOKE_TXN = INVOKE_TXN_V0 || INVOKE_TXN_V1;

const ReadMethods = [
  // Returns the version of the Starknet JSON-RPC specification being used
  {
    name: "starknet_specVersion",
    params: [],
    starknetJs: `${STARKNET_JS_PREFIX}provider.getSpecVersion().then(specVersion => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getBlockWithTxHashes("latest").then(block => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getBlockWithTxs("latest").then(block => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getBlockStateUpdate("latest").then(stateUpdate => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getStorageAt("0x124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49", "0x1001e85047571380eed1d7e1cc5a9af6a707b3d65789bb1702c7d680e5e87e", "latest").then(storage => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getTransactionStatus("0x7641514f46a77013e80215cdce2e55d5aca49c13428b885c7ecb9d3ddb4ab11").then(transactionStatus => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getTransactionByHash("0x7641514f46a77013e80215cdce2e55d5aca49c13428b885c7ecb9d3ddb4ab11").then(transaction => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getTransactionByBlockIdAndIndex("latest", 0).then(transaction => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getTransactionReceipt("0x7641514f46a77013e80215cdce2e55d5aca49c13428b885c7ecb9d3ddb4ab11").then(transactionReceipt => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getClass("latest", "0x07fc0b6ecc96a698cdac8c4ae447816d73bffdd9603faacffc0a8047149d02ed").then(class => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getClassHashAt("latest", "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7").then(classHash => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getClassAt("latest", "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7").then(class => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getBlockTransactionCount("latest").then(transactionCount => {
    console.log(transactionCount);
});
    `,
  },

  // Call a StarkNet function without creating a StarkNet transaction
  {
    name: "starknet_call",
    params: {
      request: functionCall,
      blockId,
    },
    starknetJs: ``,
    // starknetJs: `// Installation Instructions: https://https://www.starknetjs.com/
    // const { RpcProvider } = require('starknet');

    // const provider = new RpcProvider({
    //     nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/"
    // })

    // provider.callContract({
    //   contractAddress: "0x124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
    //   entrypoint: 'name',
    //   calldata: [],
    // }).then(response => {
    //     console.log(response);
    // });
    // `,
  },

  // Estimate the fee for StarkNet transactions
  {
    name: "starknet_estimateFee",
    params: {
      request: [BROADCASTED_INVOKE_TXN], //TODO:
      simulation_flags: [
        {
          placeholder: "SKIP_VALIDATE",
          description:
            "Flags that indicate how to simulate a given transaction. By default, the sequencer behavior is replicated locally",
        },
      ],
      blockId,
    },
    starknetJs: ``,
  },

  // Estimate the L2 fee of a message sent on L1
  {
    name: "starknet_estimateMessageFee",
    params: {
      message: {
        from_address: l1_address,
        to_address: contract_address,
        entry_point_selector,
        payload: {
          placeholder: [],
          description: "The payload of the message",
        },
      },
      blockId,
    },
    starknetJs: ``,
  },

  // Get the most recent accepted block number
  {
    name: "starknet_blockNumber",
    params: [],
    starknetJs: `${STARKNET_JS_PREFIX}provider.getBlockNumber().then(blockNumber => {
    console.log(blockNumber);
});
    `,
  },

  // Get the most recent accepted block hash and number
  {
    name: "starknet_blockHashAndNumber",
    params: [],
    starknetJs: `${STARKNET_JS_PREFIX}provider.getBlockLatestAccepted().then(blockHashAndNumber => {
    console.log(blockHashAndNumber);
});
    `,
  },

  // Return the currently configured StarkNet chain id
  {
    name: "starknet_chainId",
    params: [],
    starknetJs: `${STARKNET_JS_PREFIX}provider.getChainId().then(chainId => {
    console.log(chainId);
});
    `,
  },

  // Returns an object about the sync status, or false if the node is not syncing
  {
    name: "starknet_syncing",
    params: [],
    starknetJs: `${STARKNET_JS_PREFIX}provider.getSyncingStats().then(syncing => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getNonceForAddress("latest", "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7").then(nonce => {
    console.log(nonce);
});
    `,
  },
];

// const WriteMethods = [
//   // Submit a new transaction to be added to the chain
//   {
//     name: "starknet_addInvokeTransaction",
//     // params: BROADCASTED_INVOKE_TXN,
//     starknetJs: ``,
//   },

//   // Submit a new class declaration transaction
//   {
//     name: "starknet_addDeclareTransaction",
//     // params: {
//     //   declare_transaction: BROADCASTED_DECLARE_TXN,
//     // },
//     starknetJs: ``,
//   },

//   // Submit a new deploy account transaction
//   {
//     name: "starknet_addDeployAccountTransaction",
//     // params: {
//     //   deploy_account_transaction: BROADCASTED_DEPLOY_ACCOUNT_TXN,
//     // },
//     starknetJs: ` `,
//   },
// ];

const TraceMethods = [
  // For a given executed transaction, return the trace of its execution, including internal calls
  {
    name: "starknet_traceTransaction",
    params: { transaction_hash },
    starknetJs: `${STARKNET_JS_PREFIX}provider.getTransactionTrace("0x7641514f46a77013e80215cdce2e55d5aca49c13428b885c7ecb9d3ddb4ab11").then(transactionTrace => {
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
    starknetJs: `${STARKNET_JS_PREFIX}provider.getBlockTransactionsTraces("latest").then(transactionTraces => {
    console.log(transactionTraces);
});
    `,
  },

  // Simulate a given sequence of transactions on the requested state, and generate the execution traces. If one of the transactions is reverted, raises CONTRACT_ERROR
  // {
  //   name: "starknet_simulateTransactions",
  //   params: {
  //     blockId,
  //     transactions: Array<BROADCASTED_TXN>,
  //     simulation_flags: {

  //     },
  //   },
  //   starknetJs: `
  //   `,
  // },
];

export const Methods = [...ReadMethods, ...TraceMethods];
export const comingSoon = [
  "starknet_addInvokeTransaction",
  "starknet_addDeclareTransaction",
  "starknet_addDeployAccountTransaction",
  "starknet_simulateTransactions",
];
