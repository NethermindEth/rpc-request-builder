export enum Chain {
  Mainnet,
  Goerli,
  Sepolia,
}

export type BroadcastInvokeTransactionV1 = {
  type: "INVOKE_V1";
  sender_address: string;
  calldata: string[];
  max_fee: string;
  signature: string[];
  nonce: string;
};

export type BroadcastInvokeTransactionV3 = {
  type: "INVOKE_V3";
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
};

export type BroadcastDeclareTransactionV2 = {
  type: "DECLARE_V2";
  sender_address: string;
  max_fee: string;
  signature: string[];
  nonce: string;
};

export type BroadcastDeclareTransactionV3 = {
  type: "DECLARE_V3";
  sender_address: string;
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
};

export type BroadcastDeployAccountTransactionV1 = {
  type: "DEPLOY_ACCOUNT_V1";
  max_fee: string;
  signature: string[];
  nonce: string;
  contract_address_salt: string;
  constructor_calldata: string[];
  class_hash: string;
};

export type BroadcastDeployAccountTransactionV3 = {
  type: "DEPLOY_ACCOUNT_V3";
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
};

export type BroadcastTransaction =
  | BroadcastInvokeTransactionV1
  | BroadcastInvokeTransactionV3
  | BroadcastDeclareTransactionV2
  | BroadcastDeclareTransactionV3
  | BroadcastDeployAccountTransactionV1
  | BroadcastDeployAccountTransactionV3;
