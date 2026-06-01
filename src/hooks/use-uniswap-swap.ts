import { useMemo } from "react";
import {
  useAccount,
  useConnectorClient,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  createPublicClient,
  custom,
  encodeFunctionData,
  parseUnits,
  maxUint256,
  type Address,
  type Hex,
} from "viem";
import {
  ADDRESS_THIS,
  ERC20_ABI,
  isNative,
  resolveTokenForQuote,
  SWAP_ROUTER_02,
  SWAP_ROUTER_02_ABI,
} from "@/config/uniswap";
import type { Token } from "@/config/tokens";
import type { FeeTier } from "@/config/uniswap";
import { SUPPORTED_CHAINS } from "@/config/wagmi";

/**
 * Read current ERC20 allowance for SwapRouter02. Returns null for native input.
 */
export function useTokenAllowance(token: Token, chainId: number) {
  const { address } = useAccount();
  const connectorClient = useConnectorClient({ chainId });
  const chain = SUPPORTED_CHAINS.find((supportedChain) => supportedChain.id === chainId);
  const spender = SWAP_ROUTER_02[chainId];
  const skip = isNative(token.address) || !address || !spender;

  const publicClient =
    connectorClient.data && chain
      ? (createPublicClient({
          chain,
          transport: custom(connectorClient.data.transport as never),
        }) as ReturnType<typeof createPublicClient>)
      : null;

  const allowanceQuery = useQuery({
    queryKey: ["token-allowance", chainId, token.address, address ?? "0x0", spender ?? "0x0"],
    enabled: !skip && Boolean(publicClient),
    queryFn: async () => {
      if (!publicClient || !address || !spender) return 0n;
      const result = await publicClient.readContract({
        address: token.address as Address,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address, spender],
      });
      return result as bigint;
    },
  });

  return {
    allowance: skip ? maxUint256 : allowanceQuery.data ?? 0n,
    refetch: allowanceQuery.refetch,
    isFetching: allowanceQuery.isFetching,
  };
}

/**
 * Approve SwapRouter02 to spend an ERC20. Approves max for a single popup UX.
 */
export function useApproveToken(token: Token, chainId: number) {
  const spender = SWAP_ROUTER_02[chainId];
  const { writeContractAsync, data: hash, isPending, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ chainId, hash });

  async function approve() {
    if (!spender) throw new Error("Router not configured for this chain");
    return writeContractAsync({
      chainId,
      address: token.address as Address,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, maxUint256],
    });
  }

  return {
    approve,
    hash,
    isApproving: isPending || receipt.isLoading,
    isApproved: receipt.isSuccess,
    error: receipt.error,
    reset,
  };
}

interface SwapArgs {
  input: Token;
  output: Token;
  amountIn: string;
  amountOutMin: bigint;
  fee: FeeTier;
  chainId: number;
  deadlineMinutes: number;
}

export function useExecuteSwap() {
  const { address } = useAccount();
  const { writeContractAsync, data: hash, isPending, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  async function swap(args: SwapArgs) {
    if (!address) throw new Error("Wallet not connected");
    const router = SWAP_ROUTER_02[args.chainId];
    if (!router) throw new Error("Router not configured");

    const tokenInAddr = resolveTokenForQuote(args.input.address, args.chainId) as Address;
    const tokenOutAddr = resolveTokenForQuote(args.output.address, args.chainId) as Address;
    const amountIn = parseUnits(args.amountIn, args.input.decimals);
    const nativeIn = isNative(args.input.address);
    const nativeOut = isNative(args.output.address);

    // If output is native, set recipient to ADDRESS_THIS and chain unwrapWETH9 via multicall.
    const recipient = nativeOut ? (ADDRESS_THIS as Address) : (address as Address);

    const swapData = encodeFunctionData({
      abi: SWAP_ROUTER_02_ABI,
      functionName: "exactInputSingle",
      args: [
        {
          tokenIn: tokenInAddr,
          tokenOut: tokenOutAddr,
          fee: args.fee,
          recipient,
          amountIn,
          amountOutMinimum: args.amountOutMin,
          sqrtPriceLimitX96: 0n,
        },
      ],
    });

    const calls: Hex[] = [swapData];
    if (nativeOut) {
      calls.push(
        encodeFunctionData({
          abi: SWAP_ROUTER_02_ABI,
          functionName: "unwrapWETH9",
          args: [args.amountOutMin, address as Address],
        }),
      );
    }

    return writeContractAsync({
      chainId: args.chainId,
      address: router,
      abi: SWAP_ROUTER_02_ABI,
      functionName: "multicall",
      args: [calls],
      value: nativeIn ? amountIn : 0n,
    });
  }

  const status = useMemo(() => {
    if (isPending) return "submitting" as const;
    if (receipt.isLoading) return "mining" as const;
    if (receipt.isSuccess) return "success" as const;
    if (receipt.isError) return "error" as const;
    return "idle" as const;
  }, [isPending, receipt.isLoading, receipt.isSuccess, receipt.isError]);

  return {
    swap,
    hash,
    status,
    receipt: receipt.data,
    error: receipt.error,
    reset,
  };
}
