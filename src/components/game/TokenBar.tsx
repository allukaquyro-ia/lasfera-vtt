"use client";

import { Shield, Skull, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/state/SessionContext";

export function TokenBar() {
  const { state, actorsById, dispatch } = useSession();

  return (
    <div className="flex gap-3 overflow-x-auto rounded-lg border border-white/10 bg-black/45 p-3">
      {state.tokens.map((token) => {
        const actor = actorsById.get(token.actorId);
        const Icon = token.side === "enemy" ? Skull : token.side === "neutral" ? Shield : UserRound;
        return (
          <button
            key={token.id}
            className={cn(
              "flex min-w-36 items-center gap-3 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-left transition hover:border-antique/40",
              state.selectedTokenId === token.id && "border-antique/70 bg-antique/10",
            )}
            onClick={() => dispatch({ type: "select-token", tokenId: token.id })}
            type="button"
          >
            <span
              className={cn(
                "grid h-9 w-9 place-items-center rounded-md border text-antique",
                token.side === "enemy" && "border-enemy/40 bg-enemy/20",
                token.side === "ally" && "border-ally/40 bg-ally/15",
                token.side === "neutral" && "border-antique/30 bg-ruby/25",
              )}
            >
              <Icon size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{token.name}</p>
              <p className="text-xs text-stone-400">{actor?.conditions.length ? actor.conditions.join(", ") : "ativo"}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
