import { mainnet, base, arbitrum, optimism, polygon } from "wagmi/chains";
import type { Address } from "viem";

export const NATIVE_SENTINEL = "0x0000000000000000000000000000000000000000" as const;

// Uniswap V3 QuoterV2
export const QUOTER_V2: Record<number, Address> = {
  [mainnet.id]: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
  [arbitrum.id]: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
  [optimism.id]: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
  [polygon.id]: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
  [base.id]: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
};

// Uniswap SwapRouter02
export const SWAP_ROUTER_02: Record<number, Address> = {
  [mainnet.id]: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
  [arbitrum.id]: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
  [optimism.id]: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
  [polygon.id]: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
  [base.id]: "0x2626664c2603336E57B271c5C0b26F421741e481",
};

// Wrapped native per chain (WETH9 / WMATIC)
export const WRAPPED_NATIVE: Record<number, Address> = {
  [mainnet.id]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  [arbitrum.id]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  [optimism.id]: "0x4200000000000000000000000000000000000006",
  [base.id]: "0x4200000000000000000000000000000000000006",
  [polygon.id]: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
};

export const FEE_TIERS = [500, 3000, 10000] as const;
export type FeeTier = (typeof FEE_TIERS)[number];

export function isNative(address: string) {
  return address.toLowerCase() === NATIVE_SENTINEL;
}

export function resolveTokenForQuote(address: string, chainId: number): Address {
  return (isNative(address) ? WRAPPED_NATIVE[chainId] : address) as Address;
}

// SwapRouter02 sentinel for "router holds" / "msg.sender holds"
export const ADDRESS_THIS = "0x0000000000000000000000000000000000000002" as const;
export const MSG_SENDER = "0x0000000000000000000000000000000000000001" as const;

export const QUOTER_V2_ABI = [
  {
    name: "quoteExactInputSingle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "fee", type: "uint24" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" },
    ],
  },
] as const;

export const SWAP_ROUTER_02_ABI = [
  {
    name: "exactInputSingle",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    name: "multicall",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "data", type: "bytes[]" }],
    outputs: [{ name: "results", type: "bytes[]" }],
  },
  {
    name: "unwrapWETH9",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "amountMinimum", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "refundETH",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
] as const;

export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
