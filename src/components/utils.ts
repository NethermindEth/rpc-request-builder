import {
  BroadcastedTransaction,
  BroadcastedInvokeTransactionV1,
  BroadcastedInvokeTransactionV3,
  BroadcastedDeclareTransactionV2,
  BroadcastedDeclareTransactionV3,
  BroadcastedDeployAccountTransactionV1,
  BroadcastedDeployAccountTransactionV3,
} from "./types";

export const isUrlFromNethermindDomain = (url: string) => {
  try {
    // Parse the URL using the URL constructor
    const parsedUrl = new URL(url);

    // Check if the hostname matches 'rpc.nethermind.io' or 'free-rpc.nethermind.io'
    return (
      parsedUrl.hostname === "rpc.nethermind.io" ||
      parsedUrl.hostname === "free-rpc.nethermind.io"
    );
  } catch (e) {
    // If an error occurs (e.g., invalid URL), return false
    console.error((e as Error).message);
    return false;
  }
};

export const extractRpcUrl = (curlCommand: string) => {
  const rpcUrlPattern = /--location\s+'([^']+)'/;
  const match = curlCommand.match(rpcUrlPattern);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
};

export const extractNodeUrl = (starknetJsCode: string) => {
  const regex = /nodeUrl: "(.*?)"/;
  const match = regex.exec(starknetJsCode);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
};

export const capitalize = (str: string) =>
  `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

const formatRawTransaction = (rawTransaction: any) => {
  const formattedTransaction = { ...rawTransaction };
  if (rawTransaction.resource_bounds_l1_gas_max_amount) {
    formattedTransaction.resource_bounds = {
      l1_gas: {
        max_amount: rawTransaction.resource_bounds_l1_gas_max_amount,
        max_price_per_unit:
          rawTransaction.resource_bounds_l1_gas_max_price_per_unit,
      },
      l2_gas: {
        max_amount: rawTransaction.resource_bounds_l2_gas_max_amount,
        max_price_per_unit:
          rawTransaction.resource_bounds_l2_gas_max_price_per_unit,
      },
    };
    delete formattedTransaction.resource_bounds_l1_gas_max_amount;
    delete formattedTransaction.resource_bounds_l1_gas_max_price_per_unit;
    delete formattedTransaction.resource_bounds_l2_gas_max_amount;
    delete formattedTransaction.resource_bounds_l2_gas_max_price_per_unit;
  }
  return formattedTransaction;
};

export const formatRawParams = (params: any) => {
  const formattedRawParams = structuredClone(params);
  for (let prop of [
    "request",
    "invoke_transaction",
    "declare_transaction",
    "deploy_account_transaction",
    "transactions",
  ]) {
    if (formattedRawParams[prop] === undefined) {
      continue;
    } else if (Array.isArray(formattedRawParams[prop])) {
      formattedRawParams[prop] =
        formattedRawParams[prop].map(formatRawTransaction);
    } else {
      formattedRawParams[prop] = formatRawTransaction(formattedRawParams[prop]);
    }
  }
  return formattedRawParams;
};

export const formatStarknetRsParamsBlockId = (
  blockId: string | { block_hash?: string; block_number?: number }
) => {
  if (typeof blockId === "string" && ["latest", "pending"].includes(blockId)) {
    return `BlockId::Tag(BlockTag::${capitalize(blockId)})`;
  }
  if (typeof blockId === "object" && blockId.block_hash !== undefined) {
    return `BlockId::Hash(felt!("${blockId.block_hash}"))`;
  }
  if (typeof blockId === "object" && blockId.block_number !== undefined) {
    return `BlockId::Number(${blockId.block_number})`;
  }
  return "INVALID_BLOCK_ID";
};

const formatStarknetRsParamsUint = (uint: string, size: string) =>
  `${size}::from_str_radix("${uint}".trim_start_matches("0x"), 16).unwrap()`;

const formatResourceBounds = ({
  resource_bounds_l1_gas_max_amount,
  resource_bounds_l1_gas_max_price_per_unit,
  resource_bounds_l2_gas_max_amount,
  resource_bounds_l2_gas_max_price_per_unit,
}:
  | BroadcastedInvokeTransactionV3
  | BroadcastedDeclareTransactionV3
  | BroadcastedDeployAccountTransactionV3) => `ResourceBoundsMapping {
              l1_gas: ResourceBounds {
                max_amount: ${formatStarknetRsParamsUint(
                  resource_bounds_l1_gas_max_amount,
                  "u64"
                )},
                max_price_per_unit: ${formatStarknetRsParamsUint(
                  resource_bounds_l1_gas_max_price_per_unit,
                  "u128"
                )}
              },
              l2_gas: ResourceBounds {
                max_amount: ${formatStarknetRsParamsUint(
                  resource_bounds_l2_gas_max_amount,
                  "u64"
                )},
                max_price_per_unit: ${formatStarknetRsParamsUint(
                  resource_bounds_l2_gas_max_price_per_unit,
                  "u128"
                )}
              }
            }`;

const formatBroadcastedInvokeTransactionV1 = (
  transaction: BroadcastedInvokeTransactionV1
) => `BroadcastedTransaction::Invoke(
          BroadcastedInvokeTransaction::V1(
            BroadcastedInvokeTransactionV1 {
              sender_address: felt!("${transaction.sender_address}"),
              calldata: vec![${transaction.calldata
                .map((data) => `felt!("${data}")`)
                .join(", ")}],
              max_fee: felt!("${transaction.max_fee}"),
              signature: vec![${transaction.signature
                .map((sig) => `felt!("${sig}")`)
                .join(", ")}],
              nonce: felt!("${transaction.nonce}"),
              is_query: ${transaction.is_query}
            }
          ),
      )`;

const formatBroadcastedInvokeTransactionV3 = (
  transaction: BroadcastedInvokeTransactionV3
) => `BroadcastedTransaction::Invoke(
          BroadcastedInvokeTransaction::V3(
            BroadcastedInvokeTransactionV3 {
              sender_address: felt!("${transaction.sender_address}"),
              calldata: vec![${transaction.calldata
                .map((data) => `felt!("${data}")`)
                .join(", ")}],
              signature: vec![${transaction.signature
                .map((sig) => `felt!("${sig}")`)
                .join(", ")}],
              nonce: felt!("${transaction.nonce}"),
              resource_bounds: ${formatResourceBounds(transaction)},
              tip: ${formatStarknetRsParamsUint(transaction.tip, "u64")},
              paymaster_data: vec![${transaction.paymaster_data
                .map((data) => `felt!("${data}")`)
                .join(", ")}],
              account_deployment_data: vec![${transaction.account_deployment_data
                .map((data) => `felt!("${data}")`)
                .join(", ")}],
              nonce_data_availability_mode: DataAvailabilityMode::${
                transaction.nonce_data_availability_mode
              },
              fee_data_availability_mode: DataAvailabilityMode::${
                transaction.fee_data_availability_mode
              },
              is_query: ${transaction.is_query}
            }
          ),
      )`;

const formatBroadcastedDeclareTransactionV2 = (
  transaction: BroadcastedDeclareTransactionV2
) => `BroadcastedTransaction::Declare(
          BroadcastedDeclareTransaction::V2(
            BroadcastedDeclareTransactionV2 {
              sender_address: felt!("${transaction.sender_address}"),
              compiled_class_hash: felt!("${transaction.compiled_class_hash}"),
              max_fee: felt!("${transaction.max_fee}"),
              signature: vec![${transaction.signature
                .map((sig) => `felt!("${sig}")`)
                .join(", ")}],
              nonce: felt!("${transaction.nonce}"),
              contract_class: Arc::new(flattened_class),
              is_query: ${transaction.is_query}
            }
          ),
      )`;

const formatBroadcastedDeclareTransactionV3 = (
  transaction: BroadcastedDeclareTransactionV3
) => `BroadcastedTransaction::Declare(
          BroadcastedDeclareTransaction::V3(
            BroadcastedDeclareTransactionV3 {
              sender_address: felt!("${transaction.sender_address}"),
              compiled_class_hash: felt!("${transaction.compiled_class_hash}"),
              signature: vec![${transaction.signature
                .map((sig) => `felt!("${sig}")`)
                .join(", ")}],
              nonce: felt!("${transaction.nonce}"),
              contract_class: Arc::new(flattened_class),
              resource_bounds: ${formatResourceBounds(transaction)},
              tip: ${transaction.tip},
              paymaster_data: vec![${transaction.paymaster_data
                .map((data) => `felt!("${data}")`)
                .join(", ")}],
              account_deployment_data: vec![${transaction.account_deployment_data
                .map((data) => `felt!("${data}")`)
                .join(", ")}],
              nonce_data_availability_mode: DataAvailabilityMode::${
                transaction.nonce_data_availability_mode
              },
              fee_data_availability_mode: DataAvailabilityMode::${
                transaction.fee_data_availability_mode
              },
              is_query: ${transaction.is_query}
            }
          ),
      )`;

const formatBroadcastedDeployAccountTransactionV1 = (
  transaction: BroadcastedDeployAccountTransactionV1
) => `BroadcastedTransaction::DeployAccount(
          BroadcastedDeployAccountTransaction::V1(
            BroadcastedDeployAccountTransactionV1 {
              max_fee: felt!("${transaction.max_fee}"),
              signature: vec![${transaction.signature
                .map((sig) => `felt!("${sig}")`)
                .join(", ")}],
              nonce: felt!("${transaction.nonce}"),
              contract_address_salt: felt!("${
                transaction.contract_address_salt
              }"),
              constructor_calldata: vec![${transaction.constructor_calldata
                .map((data) => `felt!("${data}")`)
                .join(", ")}],
              class_hash: felt!("${transaction.class_hash}"),
              is_query: ${transaction.is_query}
            }
          ),
        )`;

const formatBroadcastedDeployAccountTransactionV3 = (
  transaction: BroadcastedDeployAccountTransactionV3
) => `BroadcastedTransaction::DeployAccount(
          BroadcastedDeployAccountTransaction::V3(
            BroadcastedDeployAccountTransactionV3 {
              signature: vec![${transaction.signature
                .map((sig) => `felt!("${sig}")`)
                .join(", ")}],
              nonce: felt!("${transaction.nonce}"),
              contract_address_salt: felt!("${
                transaction.contract_address_salt
              }"),
              constructor_calldata: vec![${transaction.constructor_calldata
                .map((data) => `felt!("${data}")`)
                .join(", ")}],
              class_hash: felt!("${transaction.class_hash}"),
              resource_bounds: ${formatResourceBounds(transaction)},
              tip: ${transaction.tip},
              paymaster_data: vec![${transaction.paymaster_data
                .map((data) => `felt!("${data}")`)
                .join(", ")}],
              nonce_data_availability_mode: DataAvailabilityMode::${
                transaction.nonce_data_availability_mode
              },
              fee_data_availability_mode: DataAvailabilityMode::${
                transaction.fee_data_availability_mode
              },
              is_query: ${transaction.is_query}
            }
          ),
      )`;

export const formatStarknetRsParamsTransactions = (
  transactions: BroadcastedTransaction[]
) => {
  const transactionsFormatted = transactions
    .map((transaction) => {
      switch (transaction.type) {
        case "INVOKE_V1": {
          return formatBroadcastedInvokeTransactionV1(transaction);
        }
        case "INVOKE_V3": {
          return formatBroadcastedInvokeTransactionV3(transaction);
        }
        case "DECLARE_V2": {
          return formatBroadcastedDeclareTransactionV2(transaction);
        }
        case "DECLARE_V3": {
          return formatBroadcastedDeclareTransactionV3(transaction);
        }
        case "DEPLOY_ACCOUNT_V1": {
          return formatBroadcastedDeployAccountTransactionV1(transaction);
        }
        case "DEPLOY_ACCOUNT_V3": {
          return formatBroadcastedDeployAccountTransactionV3(transaction);
        }
        default: {
          return "INVALID_TRANSACTION";
        }
      }
    })
    .join(", ");
  return `
      vec![${transactionsFormatted}]`;
};

export const formatStarknetRsParamsSimulationFlags = (
  simulationFlags: string[]
) => {
  const simulationFlagsEnums = simulationFlags
    .map((simulationFlag) => {
      switch (simulationFlag) {
        case "SKIP_VALIDATE": {
          return "SimulationFlag::SkipValidate";
        }
        case "SKIP_FEE_CHARGE": {
          return "SimulationFlag::SkipFeeCharge";
        }
        default: {
          return;
        }
      }
    })
    .join(", ");
  return `
      vec![${simulationFlagsEnums}]`;
};

export const toCamelCase = (str: string) => {
  return str.replace(/_([a-z])/g, function (match, letter) {
    return letter.toUpperCase();
  });
};
