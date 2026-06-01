import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, arbitrum, optimism, base } from "wagmi/chains";
import { http } from "viem";

// Public WalletConnect project id — replace with your own to remove demo limits.
const WC_PROJECT_ID = "3a8170812b534d0ff9d794f19a901d64";

export const wagmiConfig = getDefaultConfig({
  appName: " DEX",
  projectId: WC_PROJECT_ID,
  chains: [mainnet, base, arbitrum, optimism, polygon],
  transports: {
    [mainnet.id]: http("https://cloudflare-eth.com"),
    [base.id]: http("https://mainnet.base.org"),
    [arbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
    [optimism.id]: http("https://mainnet.optimism.io"),
    [polygon.id]: http("https://polygon.drpc.org"),
  },
  ssr: true,
});

export const SUPPORTED_CHAINS = [mainnet, base, arbitrum, optimism, polygon];
