export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  chainId: number;
  priceUsd?: number;
}

// Curated token list. Prices are mock fallbacks used when no live source is wired.
export const TOKENS: Token[] = [
  { chainId: 1, address: "0x0000000000000000000000000000000000000000", symbol: "ETH", name: "Ether", decimals: 18, priceUsd: 3420.55 },
  { chainId: 1, address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin", decimals: 6, priceUsd: 1 },
  { chainId: 1, address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether", decimals: 6, priceUsd: 1 },
  { chainId: 1, address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", name: "Dai", decimals: 18, priceUsd: 1 },
  { chainId: 1, address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", name: "Wrapped BTC", decimals: 8, priceUsd: 67234.12 },
  { chainId: 1, address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", symbol: "UNI", name: "Uniswap", decimals: 18, priceUsd: 8.42 },
  { chainId: 1, address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK", name: "Chainlink", decimals: 18, priceUsd: 14.21 },
  { chainId: 1, address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", symbol: "MATIC", name: "Polygon", decimals: 18, priceUsd: 0.52 },
];

export function tokensForChain(chainId: number) {
  return TOKENS.filter((t) => t.chainId === chainId || chainId === 1);
}

export const DEFAULT_INPUT = TOKENS[0];
export const DEFAULT_OUTPUT = TOKENS[1];
