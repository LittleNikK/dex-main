import { useSwapStore } from "@/store/swap-store";
import { X } from "lucide-react";

const PRESETS = [0.1, 0.5, 1.0];

export function SettingsPopover({ onClose }: { onClose: () => void }) {
  const { slippage, deadline, setSlippage, setDeadline } = useSwapStore();

  return (
    <div className="glass w-80 rounded-2xl p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Transaction settings</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Slippage tolerance
          </label>
          <div className="flex items-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setSlippage(p)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  slippage === p
                    ? "bg-gradient-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}%
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1 rounded-full bg-surface px-3 py-1.5">
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(Number(e.target.value) || 0)}
                step="0.1"
                min="0"
                max="50"
                className="w-12 bg-transparent text-right text-xs outline-none"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>
          {slippage > 5 && (
            <p className="mt-2 text-xs text-warning">High slippage. Your trade may be front-run.</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Transaction deadline
          </label>
          <div className="flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 w-fit">
            <input
              type="number"
              value={deadline}
              onChange={(e) => setDeadline(Number(e.target.value) || 0)}
              min="1"
              max="180"
              className="w-12 bg-transparent text-xs outline-none"
            />
            <span className="text-xs text-muted-foreground">minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
