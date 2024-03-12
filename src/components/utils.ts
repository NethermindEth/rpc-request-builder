import {
  FunctionCall,
  BroadcastedTransaction,
  BroadcastedInvokeTransactionV1,
  BroadcastedInvokeTransactionV3,
  BroadcastedDeclareTransactionV2,
  BroadcastedDeclareTransactionV3,
  BroadcastedDeployAccountTransactionV1,
  BroadcastedDeployAccountTransactionV3,
  MsgFromL1,
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

export const formatStarknetRsParamsFunctionCall = (
  functionCall: FunctionCall
) => `FunctionCall {
        contract_address: felt!("${functionCall.contract_address}"),
        entry_point_selector: felt!("${functionCall.entry_point_selector}"),
        calldata: vec![${functionCall.calldata
          .map((data) => `felt!("${data}")`)
          .join(", ")}],
      }`;

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
) => `BroadcastedInvokeTransaction::V1(
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
          )`;

const formatBroadcastedInvokeTransactionV3 = (
  transaction: BroadcastedInvokeTransactionV3
) => `BroadcastedInvokeTransaction::V3(
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
          )`;

const formatBroadcastedDeclareTransactionV2 = (
  transaction: BroadcastedDeclareTransactionV2
) => `BroadcastedDeclareTransaction::V2(
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
          )`;

const formatBroadcastedDeclareTransactionV3 = (
  transaction: BroadcastedDeclareTransactionV3
) => `BroadcastedDeclareTransaction::V3(
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
          )`;

const formatBroadcastedDeployAccountTransactionV1 = (
  transaction: BroadcastedDeployAccountTransactionV1
) => `BroadcastedDeployAccountTransaction::V1(
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
          )`;

const formatBroadcastedDeployAccountTransactionV3 = (
  transaction: BroadcastedDeployAccountTransactionV3
) => `BroadcastedDeployAccountTransaction::V3(
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
            resource_bounds: resource_bounds: ${formatResourceBounds(
              transaction
            )},
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
        )`;

export const formatStarknetRsParamsInvokeTransaction = (
  transaction: BroadcastedInvokeTransactionV1 | BroadcastedInvokeTransactionV3
) => {
  switch (transaction.version) {
    case "0x1": {
      return formatBroadcastedInvokeTransactionV1(transaction);
    }
    case "0x3": {
      return formatBroadcastedInvokeTransactionV3(transaction);
    }
    default: {
      return "INVALID_TRANSACTION";
    }
  }
};

export const formatStarknetRsParamsDeclareTransaction = (
  transaction: BroadcastedDeclareTransactionV2 | BroadcastedDeclareTransactionV3
) => {
  switch (transaction.version) {
    case "0x2": {
      return formatBroadcastedDeclareTransactionV2(transaction);
    }
    case "0x3": {
      return formatBroadcastedDeclareTransactionV3(transaction);
    }
    default: {
      return "INVALID_TRANSACTION";
    }
  }
};

export const formatStarknetRsParamsDeployAccountTransaction = (
  transaction:
    | BroadcastedDeployAccountTransactionV1
    | BroadcastedDeployAccountTransactionV3
) => {
  switch (transaction.version) {
    case "0x1": {
      return formatBroadcastedDeployAccountTransactionV1(transaction);
    }
    case "0x3": {
      return formatBroadcastedDeployAccountTransactionV3(transaction);
    }
    default: {
      return "INVALID_TRANSACTION";
    }
  }
};

export const formatStarknetRsParamsTransactions = (
  transactions: BroadcastedTransaction[]
) => {
  const transactionsFormatted = transactions
    .map((transaction) => {
      switch (transaction.type) {
        case "INVOKE": {
          return `BroadcastedTransaction::Invoke(
            ${formatStarknetRsParamsInvokeTransaction(transaction)}
          )`;
        }
        case "DECLARE": {
          return `BroadcastedTransaction::Declare(
            ${formatStarknetRsParamsDeclareTransaction(transaction)}
          )`;
        }
        case "DEPLOY_ACCOUNT": {
          return `BroadcastedTransaction::DeployAccount(
            ${formatStarknetRsParamsDeployAccountTransaction(transaction)}
          )`;
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

export const cleanTransaction = (t: any) => {
  const result = { ...t };
  for (const prop of [
    "calldata",
    "signature",
    "paymaster_data",
    "account_deployment_data",
    "constructor_calldata",
  ]) {
    result[prop] = Array.isArray(t[prop]) ? t[prop] : [];
  }
  return result;
};

export const formatStarknetRsParamsSimulationFlags = (
  simulationFlags: string[],
  estimateFee: boolean
) => {
  const simulationFlagsEnums = simulationFlags
    .map((simulationFlag) => {
      switch (simulationFlag) {
        case "SKIP_VALIDATE": {
          return estimateFee
            ? "SimulationFlagForEstimateFee::SkipValidate"
            : "SimulationFlag::SkipValidate";
        }
        case "SKIP_FEE_CHARGE": {
          return estimateFee
            ? "INVALID_SIMULATION_FLAG"
            : "SimulationFlag::SkipFeeCharge";
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

export const formatStarknetRsParamsMsgFromL1 = (
  msgFromL1: MsgFromL1
) => `MsgFromL1 {
      from_address: EthAddress::from_hex("${msgFromL1.from_address}").unwrap(),
      to_address: felt!("${msgFromL1.to_address}"),
      entry_point_selector: felt!("${msgFromL1.entry_point_selector}"),
      payload: vec![${msgFromL1.payload
        .map((data) => `felt!("${data}")`)
        .join(", ")}],
    }`;

export const toCamelCase = (str: string) => {
  return str.replace(/_([a-z])/g, function (match, letter) {
    return letter.toUpperCase();
  });
};
