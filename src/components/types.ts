export enum Chain {
  Mainnet,
  Goerli,
  Sepolia,
}

export type BroadcastedInvokeTransactionV1 = {
  type: "INVOKE";
  version: "0x1";
  sender_address: string;
  calldata: string[];
  max_fee: string;
  signature: string[];
  nonce: string;
  is_query: boolean;
};

export type BroadcastedInvokeTransactionV3 = {
  type: "INVOKE";
  version: "0x3";
  sender_address: string;
  calldata: string[];
  signature: string[];
  nonce: string;
  resource_bounds_l1_gas_max_amount: string;
  resource_bounds_l1_gas_max_price_per_unit: string;
  resource_bounds_l2_gas_max_amount: string;
  resource_bounds_l2_gas_max_price_per_unit: string;
  tip: string;
  paymaster_data: string[];
  account_deployment_data: string[];
  nonce_data_availability_mode: string;
  fee_data_availability_mode: string;
  is_query: boolean;
};

export type BroadcastedDeclareTransactionV2 = {
  type: "DECLARE";
  version: "0x2";
  sender_address: string;
  compiled_class_hash: string;
  max_fee: string;
  signature: string[];
  nonce: string;
  is_query: boolean;
};

export type BroadcastedDeclareTransactionV3 = {
  type: "DECLARE";
  version: "0x3";
  sender_address: string;
  compiled_class_hash: string;
  signature: string[];
  nonce: string;
  resource_bounds_l1_gas_max_amount: string;
  resource_bounds_l1_gas_max_price_per_unit: string;
  resource_bounds_l2_gas_max_amount: string;
  resource_bounds_l2_gas_max_price_per_unit: string;
  tip: string;
  paymaster_data: string[];
  account_deployment_data: string[];
  nonce_data_availability_mode: string;
  fee_data_availability_mode: string;
  is_query: boolean;
};

export type BroadcastedDeployAccountTransactionV1 = {
  type: "DEPLOY_ACCOUNT";
  version: "0x1";
  max_fee: string;
  signature: string[];
  nonce: string;
  contract_address_salt: string;
  constructor_calldata: string[];
  class_hash: string;
  is_query: boolean;
};

export type BroadcastedDeployAccountTransactionV3 = {
  type: "DEPLOY_ACCOUNT";
  version: "0x3";
  signature: string[];
  nonce: string;
  contract_address_salt: string;
  constructor_calldata: string[];
  class_hash: string;
  resource_bounds_l1_gas_max_amount: string;
  resource_bounds_l1_gas_max_price_per_unit: string;
  resource_bounds_l2_gas_max_amount: string;
  resource_bounds_l2_gas_max_price_per_unit: string;
  tip: string;
  paymaster_data: string[];
  nonce_data_availability_mode: string;
  fee_data_availability_mode: string;
  is_query: boolean;
};

export type BroadcastedTransaction =
  | BroadcastedInvokeTransactionV1
  | BroadcastedInvokeTransactionV3
  | BroadcastedDeclareTransactionV2
  | BroadcastedDeclareTransactionV3
  | BroadcastedDeployAccountTransactionV1
  | BroadcastedDeployAccountTransactionV3;
