import { ReactNode, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/config/wagmi";

export function Web3Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider
        modalSize="compact"
        theme={darkTheme({
          accentColor: "oklch(0.7 0.22 340)",
          accentColorForeground: "white",
          borderRadius: "large",
          overlayBlur: "small",
        })}
      >
        <div style={{ visibility: mounted ? "visible" : "hidden" }}>{children}</div>
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
