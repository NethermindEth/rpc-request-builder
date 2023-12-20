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
import * as Errors from "./errors";
import {
  BlockHashAndNumber,
  BlockTransactionsTraces,
  BlockWithTxHashes,
  BlockWithTxs,
  ContractClass,
  DeclaredTransaction,
  DeployedAccountTransaction,
  Events,
  FeeEstimate,
  InvokedTransaction,
  Nonce,
  SimulateTransactionResponse,
  Syncing,
  TransactionReceipt,
  TransactionStatus,
  TransactionTrace,
  TransactionWithHash,
} from "./nonspec";

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
    { name: "block_number", pattern: "[0-9]+", placeholder: "474703" },
  ],
};

const contract_address = {
  placeholder:
    "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7",
  description: "The address of the contract",
};

const transaction_hash = {
  placeholder:
    "0x7641514f46a77013e80215cdce2e55d5aca49c13428b885c7ecb9d3ddb4ab11",
  description: "The hash of the requested transaction",
};

export const INVOKE_TXN_V0 = {
  type: "INVOKE",
  max_fee: "FELT",
  version: "0x0",
  signature: "SIGNATURE",
  contract_address,
  entry_point_selector: "FELT",
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
  },

  // Get block information with transaction hashes given the block id
  {
    name: "starknet_getBlockWithTxHashes",
    params: {
      blockId: blockId,
    },
  },

  // Get block information with full transactions given the block id
  {
    name: "starknet_getBlockWithTxs",
    params: {
      blockId: blockId,
    },
  },

  // Get the information about the result of executing the requested block
  {
    name: "starknet_getStateUpdate",
    params: {
      blockId: blockId,
    },
  },

  // Get the value of the storage at the given address and key
  {
    name: "starknet_getStorageAt",
    params: {
      contract_address,
      key: {
        placeholder: "",
      },
      blockId,
    },
  },

  // Gets the transaction status (possibly reflecting that the tx is still in the mempool, or dropped from it)
  {
    name: "starknet_getTransactionStatus",
    params: {
      transaction_hash,
    },
  },

  // Get the details and status of a submitted transaction
  {
    name: "starknet_getTransactionByHash",
    params: {
      transaction_hash,
    },
  },

  // Get the details of a transaction by a given block id and index
  {
    name: "starknet_getTransactionByBlockIdAndIndex",
    params: {
      blockId,
      index: {
        placeholder: "0",
        description: "The index of the transaction in the block",
      },
    },
  },

  // Get the transaction receipt by the transaction hash
  {
    name: "starknet_getTransactionReceipt",
    params: {
      transaction_hash,
    },
  },

  // Get the contract class definition in the given block associated with the given hash
  {
    name: "starknet_getClass",
    params: {
      blockId,
      class_hash: "FELT",
    },
  },

  // Get the contract class hash in the given block for the contract deployed at the given address
  {
    name: "starknet_getClassHashAt",
    params: {
      blockId,
      contract_address,
    },
  },

  // Get the contract class definition in the given block at the given address
  {
    name: "starknet_getClassAt",
    params: {
      blockId,
      contract_address,
    },
  },

  // Get the number of transactions in a block given a block id
  {
    name: "starknet_getBlockTransactionCount",
    params: {
      blockId: blockId,
    },
  },

  // Call a StarkNet function without creating a StarkNet transaction
  {
    name: "starknet_call",
    params: {
      request: "FUNCTION_CALL",
      blockId,
    },
  },

  // Estimate the fee for StarkNet transactions
  {
    name: "starknet_estimateFee",
    params: {
      request: "BROADCASTED_TXN[]", //TODO:
      blockId,
    },
  },

  // Estimate the L2 fee of a message sent on L1
  {
    name: "starknet_estimateMessageFee",
    params: {
      message: "MSG_FROM_L1",
      blockId,
    },
  },

  // Get the most recent accepted block number
  {
    name: "starknet_blockNumber",
    params: [],
  },

  // Get the most recent accepted block hash and number
  {
    name: "starknet_blockHashAndNumber",
    params: [],
  },

  // Return the currently configured StarkNet chain id
  {
    name: "starknet_chainId",
    params: [],
  },

  // Returns an object about the sync status, or false if the node is not syncing
  {
    name: "starknet_syncing",
    params: [],
  },

  // Returns all events matching the given filter
  {
    name: "starknet_getEvents",
    params: {
      filter: "'EVENT_FILTER' & 'RESULT_PAGE_REQUEST'",
    },
  },

  // Get the nonce associated with the given address in the given block
  {
    name: "starknet_getNonce",
    params: {
      blockId,
      contract_address,
    },
  },
];

const WriteMethods = [
  // Submit a new transaction to be added to the chain
  {
    name: "starknet_addInvokeTransaction",
    params: BROADCASTED_INVOKE_TXN,
  },

  // Submit a new class declaration transaction
  {
    name: "starknet_addDeclareTransaction",
    params: {
      declare_transaction: "BROADCASTED_DECLARE_TXN",
    },
  },

  // Submit a new deploy account transaction
  {
    name: "starknet_addDeployAccountTransaction",
    params: {
      deploy_account_transaction: "BROADCASTED_DEPLOY_ACCOUNT_TXN",
    },
  },
];

const TraceMethods = [
  // For a given executed transaction, return the trace of its execution, including internal calls
  {
    name: "starknet_traceTransaction",
    params: { transaction_hash },
  },

  // Returns the execution traces of all transactions included in the given block
  {
    name: "starknet_traceBlockTransactions",
    params: {
      blockId: blockId,
    },
  },

  // Simulate a given sequence of transactions on the requested state, and generate the execution traces. If one of the transactions is reverted, raises CONTRACT_ERROR
  {
    name: "starknet_simulateTransactions",
    params: {
      blockId,
      transactions: Array<BROADCASTED_TXN>,
      simulation_flags: Array<SIMULATION_FLAG>,
    },
  },
];

export const Methods = [...ReadMethods, ...WriteMethods, ...TraceMethods];
