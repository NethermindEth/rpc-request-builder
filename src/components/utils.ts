import {
  BroadcastTransaction,
  BroadcastInvokeTransactionV1,
  BroadcastInvokeTransactionV3,
  BroadcastDeclareTransactionV2,
  BroadcastDeclareTransactionV3,
  BroadcastDeployAccountTransactionV1,
  BroadcastDeployAccountTransactionV3,
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

const formatBroadcastInvokeTransactionV1 = (
  transaction: BroadcastInvokeTransactionV1
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
              is_query: false
            }
          )
        )`;

const formatBroadcastInvokeTransactionV3 = (
  transaction: BroadcastInvokeTransactionV3
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
              resource_bounds: ResourceBoundsMapping {
                l1_gas: ResourceBounds {
                  max_amount: ${transaction.resource_bounds_l1_gas_max_amount},
                  max_price_per_unit: ${
                    transaction.resource_bounds_l1_gas_max_price_per_unit
                  }
                },
                l2_gas: ResourceBounds {
                    max_amount: ${
                      transaction.resource_bounds_l2_gas_max_amount
                    },
                    max_price_per_unit: ${
                      transaction.resource_bounds_l2_gas_max_price_per_unit
                    }
                }
              },
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
              is_query: false
            }
          )
        )`;

const formatBroadcastDeclareTransactionV2 = (
  transaction: BroadcastDeclareTransactionV2
) => `BroadcastedTransaction::Declare(
          BroadcastedDeclareTransaction::V2(
            BroadcastedDeclareTransactionV2 {
              sender_address: felt!("${transaction.sender_address}"),
              compiled_class_hash,
              max_fee: felt!("${transaction.max_fee}"),
              signature: vec![${transaction.signature
                .map((sig) => `felt!("${sig}")`)
                .join(", ")}],
              nonce: felt!("${transaction.nonce}"),
              contract_class: Arc::new(flattened_class),
              is_query: false
            }
          )
        )`;

const formatBroadcastDeclareTransactionV3 = (
  transaction: BroadcastDeclareTransactionV3
) => `BroadcastedTransaction::Declare(
          BroadcastedDeclareTransaction::V3(
            BroadcastedDeclareTransactionV3 {
              sender_address: felt!("${transaction.sender_address}"),
              compiled_class_hash,
              signature: vec![${transaction.signature
                .map((sig) => `felt!("${sig}")`)
                .join(", ")}],
              nonce: felt!("${transaction.nonce}"),
              contract_class: Arc::new(flattened_class),
              resource_bounds: ResourceBoundsMapping {
                l1_gas: ResourceBounds {
                  max_amount: ${transaction.resource_bounds_l1_gas_max_amount},
                  max_price_per_unit: ${
                    transaction.resource_bounds_l1_gas_max_price_per_unit
                  }
                },
                l2_gas: ResourceBounds {
                  max_amount: ${transaction.resource_bounds_l2_gas_max_amount},
                  max_price_per_unit: ${
                    transaction.resource_bounds_l2_gas_max_price_per_unit
                  }
                }
              },
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
              is_query: false
            }
          )
        )`;

const formatBroadcastDeployAccountTransactionV1 = (
  transaction: BroadcastDeployAccountTransactionV1
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
              is_query: false
            }
          )
        )`;

const formatBroadcastDeployAccountTransactionV3 = (
  transaction: BroadcastDeployAccountTransactionV3
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
              resource_bounds: ResourceBoundsMapping {
                l1_gas: ResourceBounds {
                  max_amount: ${transaction.resource_bounds_l1_gas_max_amount},
                  max_price_per_unit: ${
                    transaction.resource_bounds_l1_gas_max_price_per_unit
                  }
                },
                l2_gas: ResourceBounds {
                  max_amount: ${transaction.resource_bounds_l2_gas_max_amount},
                  max_price_per_unit: ${
                    transaction.resource_bounds_l2_gas_max_price_per_unit
                  }
                }
              },
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
              is_query: false
            }
          )
        )`;

export const formatStarknetRsParamsTransactions = (
  transactions: BroadcastTransaction[]
) => {
  const transactionsFormatted = transactions
    .map((transaction) => {
      switch (transaction.type) {
        case "INVOKE_V1": {
          return formatBroadcastInvokeTransactionV1(transaction);
        }
        case "INVOKE_V3": {
          return formatBroadcastInvokeTransactionV3(transaction);
        }
        case "DECLARE_V2": {
          return formatBroadcastDeclareTransactionV2(transaction);
        }
        case "DECLARE_V3": {
          return formatBroadcastDeclareTransactionV3(transaction);
        }
        case "DEPLOY_ACCOUNT_V1": {
          return formatBroadcastDeployAccountTransactionV1(transaction);
        }
        case "DEPLOY_ACCOUNT_V3": {
          return formatBroadcastDeployAccountTransactionV3(transaction);
        }
        default: {
          return "INVALID_TRANSACTION";
        }
      }
    })
    .join(", ");
  return `
      vec![
        ${transactionsFormatted}
      ]`;
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
          return "INVALID_SIMULATION_FLAG";
        }
      }
    })
    .join(", ");
  return `
      vec![${simulationFlagsEnums}]`;
};
