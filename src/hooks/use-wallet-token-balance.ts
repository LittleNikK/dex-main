import { useQuery } from "@tanstack/react-query";
import { useAccount, useConnectorClient } from "wagmi";
import { createPublicClient, custom, type Address } from "viem";
import { ERC20_ABI, isNative } from "@/config/uniswap";
import type { Token } from "@/config/tokens";
import { SUPPORTED_CHAINS } from "@/config/wagmi";

export function useWalletTokenBalance(token: Token, chainId: number) {
  const { address, isConnected } = useAccount();
  const connectorClient = useConnectorClient({ chainId });
  const chain = SUPPORTED_CHAINS.find((supportedChain) => supportedChain.id === chainId);
  const publicClient =
    connectorClient.data && chain
      ? (createPublicClient({
          chain,
          transport: custom(connectorClient.data.transport as never),
        }) as ReturnType<typeof createPublicClient>)
      : null;

  const query = useQuery({
    queryKey: ["wallet-token-balance", chainId, token.address, address ?? "0x0"],
    enabled: isConnected && Boolean(address) && Boolean(publicClient),
    refetchInterval: 12_000,
    queryFn: async () => {
      if (!publicClient || !address) return 0n;

      if (isNative(token.address)) {
        return publicClient.getBalance({ address });
      }

      const balance = await publicClient.readContract({
        address: token.address as Address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      return balance as bigint;
    },
  });

  return {
    balance: query.data ?? 0n,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
}