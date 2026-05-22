import { Shield, Skull, UserRound } from "lucide-react";
import { activeTokens } from "@/data/campaign";

export function TokenBar() {
  return (
    <div className="flex gap-3 overflow-x-auto rounded-lg border border-white/10 bg-black/35 p-3">
      {activeTokens.map((token) => {
        const Icon = token.side === "enemy" ? Skull : token.side === "neutral" ? Shield : UserRound;
        return (
          <div key={token.id} className="flex min-w-32 items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
            <span className="grid h-9 w-9 place-items-center rounded-md border border-antique/30 bg-ruby/25 text-antique">
              <Icon size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{token.name}</p>
              <p className="text-xs text-stone-400">ativo</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
