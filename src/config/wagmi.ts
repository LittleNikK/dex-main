import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, arbitrum, optimism, base } from "wagmi/chains";
import { http } from "wagmi";

// Public WalletConnect project id — replace with your own to remove demo limits.
const WC_PROJECT_ID = "3a8170812b534d0ff9d794f19a901d64";

export const wagmiConfig = getDefaultConfig({
  appName: "Lovable DEX",
  projectId: WC_PROJECT_ID,
  chains: [mainnet, base, arbitrum, optimism, polygon],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
  ssr: true,
});

export const SUPPORTED_CHAINS = [mainnet, base, arbitrum, optimism, polygon];
