"use client";

import { cn } from "@/lib/utils";
import { useSession } from "@/state/SessionContext";

export function MapGrid() {
  const { state, actorsById, dispatch } = useSession();

  return (
    <div
      className="relative min-h-[420px] overflow-hidden rounded-lg border border-antique/25 bg-[#15100f] shadow-ember rune-grid sm:min-h-[520px] xl:min-h-[calc(100vh-17rem)]"
      onClick={() => dispatch({ type: "clear-selection" })}
      role="presentation"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(159,18,57,0.2),transparent_45%),linear-gradient(135deg,rgba(201,164,93,0.12),transparent_35%)]" />
      <div className="absolute left-6 top-6 rounded-md border border-antique/25 bg-black/55 px-3 py-2 text-xs uppercase tracking-[0.18em] text-antique">
        Mapa: Vale Vermelho
      </div>
      <div className="absolute right-6 top-6 rounded-md border border-white/10 bg-black/50 px-3 py-2 text-xs text-stone-300">
        Grid 1,5m | Zoom 100%
      </div>
      {state.tokens.map((token) => {
        const actor = actorsById.get(token.actorId);

        return (
          <button
            key={token.id}
            className={cn(
              "absolute grid h-12 w-12 place-items-center rounded-full border-2 text-sm font-bold text-white shadow-ember ring-4 ring-black/35 transition hover:scale-105",
              token.side === "enemy" && "border-red-200 bg-enemy",
              token.side === "ally" && "border-green-200 bg-ally/80",
              token.side === "neutral" && "border-antique bg-ruby",
              state.selectedTokenId === token.id && "scale-110 ring-antique/60",
            )}
            style={{ left: `${token.x}%`, top: `${token.y}%` }}
            title={token.name}
            onClick={(event) => {
              event.stopPropagation();
              dispatch({ type: "select-token", tokenId: token.id });
            }}
            type="button"
          >
            {actor?.name.slice(0, 1) ?? token.name.slice(0, 1)}
          </button>
        );
      })}
      <div className="absolute bottom-8 right-8 h-20 w-20 rounded-full border border-arcane/40 bg-arcane/15 blur-[1px]" />
    </div>
  );
}
