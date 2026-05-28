import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_INPUT, DEFAULT_OUTPUT, type Token } from "@/config/tokens";

interface SwapState {
  slippage: number; // %
  deadline: number; // minutes
  inputToken: Token;
  outputToken: Token;
  setSlippage: (s: number) => void;
  setDeadline: (d: number) => void;
  setInputToken: (t: Token) => void;
  setOutputToken: (t: Token) => void;
  flip: () => void;
}

export const useSwapStore = create<SwapState>()(
  persist(
    (set, get) => ({
      slippage: 0.5,
      deadline: 30,
      inputToken: DEFAULT_INPUT,
      outputToken: DEFAULT_OUTPUT,
      setSlippage: (slippage) => set({ slippage }),
      setDeadline: (deadline) => set({ deadline }),
      setInputToken: (inputToken) => set({ inputToken }),
      setOutputToken: (outputToken) => set({ outputToken }),
      flip: () => {
        const { inputToken, outputToken } = get();
        set({ inputToken: outputToken, outputToken: inputToken });
      },
    }),
    { name: "dex-swap-prefs" }
  )
);
