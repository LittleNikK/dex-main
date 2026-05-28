import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { parseUnits, formatUnits, type Address } from "viem";
import {
  FEE_TIERS,
  QUOTER_V2,
  QUOTER_V2_ABI,
  resolveTokenForQuote,
  type FeeTier,
} from "@/config/uniswap";
import type { Token } from "@/config/tokens";

export interface QuoteResult {
  amountOut: bigint;
  amountOutFormatted: string;
  fee: FeeTier;
  gasEstimate: bigint;
}

/**
 * Quote an exact-input swap by trying all standard V3 fee tiers in parallel
 * via QuoterV2.quoteExactInputSingle (simulated). Returns the best output.
 */
export function useUniswapQuote(
  input: Token,
  output: Token,
  amount: string,
  chainId: number,
) {
  const publicClient = usePublicClient({ chainId });

  const enabled =
    !!publicClient &&
    !!QUOTER_V2[chainId] &&
    !!amount &&
    Number(amount) > 0 &&
    input.address.toLowerCase() !== output.address.toLowerCase();

  return useQuery<QuoteResult | null>({
    queryKey: [
      "uniswap-quote",
      chainId,
      input.address,
      output.address,
      amount,
      input.decimals,
    ],
    enabled,
    refetchInterval: 12_000,
    queryFn: async () => {
      if (!publicClient) return null;
      const amountIn = parseUnits(amount, input.decimals);
      const tokenIn = resolveTokenForQuote(input.address, chainId);
      const tokenOut = resolveTokenForQuote(output.address, chainId);
      const quoter = QUOTER_V2[chainId];

      const results = await Promise.allSettled(
        FEE_TIERS.map((fee) =>
          publicClient.simulateContract({
            address: quoter,
            abi: QUOTER_V2_ABI,
            functionName: "quoteExactInputSingle",
            args: [
              {
                tokenIn: tokenIn as Address,
                tokenOut: tokenOut as Address,
                amountIn,
                fee,
                sqrtPriceLimitX96: 0n,
              },
            ],
          }),
        ),
      );

      let best: QuoteResult | null = null;
      results.forEach((r, i) => {
        if (r.status !== "fulfilled") return;
        const [amountOut, , , gasEstimate] = r.value.result as readonly [
          bigint,
          bigint,
          number,
          bigint,
        ];
        if (!best || amountOut > best.amountOut) {
          best = {
            amountOut,
            amountOutFormatted: formatUnits(amountOut, output.decimals),
            fee: FEE_TIERS[i],
            gasEstimate,
          };
        }
      });
      return best;
    },
  });
}
