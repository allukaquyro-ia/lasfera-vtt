"use client";

import { Shield, Skull, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/state/SessionContext";
import { useUi } from "@/state/UiContext";

export function TokenBar() {
  const { state, actorsById, dispatch } = useSession();
  const { openCharacterSheet } = useUi();

  if (state.combat.active && state.combat.order.length) {
    return (
      <div className="flex gap-3 overflow-x-auto rounded-lg border border-antique/25 bg-black/45 p-3">
        {state.combat.order.map((entry, index) => {
          const actor = actorsById.get(entry.actorId);
          const token = state.tokens.find((item) => item.actorId === entry.actorId);
          const isCurrent = index === state.combat.turnIndex;

          return (
            <button
              key={entry.actorId}
              className={cn(
                "flex min-w-44 items-center gap-3 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-left transition hover:border-antique/40",
                isCurrent && "border-antique/70 bg-antique/15 shadow-ember",
              )}
              onClick={() => {
                if (token) dispatch({ type: "select-token", tokenId: token.id });
                if (actor?.kind === "character") openCharacterSheet(actor.id);
              }}
              type="button"
            >
              <span className={cn("grid h-9 w-9 place-items-center rounded-md border text-sm font-bold", isCurrent ? "border-antique bg-ruby text-white" : "border-white/10 bg-black/30 text-antique")}>
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-white">{entry.name}</p>
                  <span className="text-xs text-antique">{entry.total}</span>
                </div>
                <p className="truncate text-xs text-stone-400">
                  HP {actor ? `${actor.hp}/${actor.maxHp}` : "-"} {actor?.conditions[0] ? `| ${actor.conditions[0]}` : ""}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

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
            onClick={() => {
              dispatch({ type: "select-token", tokenId: token.id });
              if (actor?.kind === "character") openCharacterSheet(actor.id);
            }}
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
