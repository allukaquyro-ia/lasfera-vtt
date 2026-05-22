"use client";

import { cn } from "@/lib/utils";
import { useSession } from "@/state/SessionContext";

export function MapGrid() {
  const { state, actorsById, selectedTokenActor, dispatch } = useSession();
  const selectedToken = state.tokens.find((token) => token.id === state.selectedTokenId);

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-lg border border-antique/25 bg-[#15100f] rune-grid shadow-ember">
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
            onClick={() => dispatch({ type: "select-token", tokenId: token.id })}
            type="button"
          >
            {actor?.name.slice(0, 1) ?? token.name.slice(0, 1)}
          </button>
        );
      })}
      <div className="absolute bottom-8 right-8 h-20 w-20 rounded-full border border-arcane/40 bg-arcane/15 blur-[1px]" />
      {selectedToken && selectedTokenActor ? (
        <div className="absolute bottom-6 left-6 w-72 rounded-lg border border-antique/30 bg-black/75 p-4 backdrop-blur">
          <p className="section-title">Token selecionado</p>
          <h3 className="mt-1 text-xl font-bold text-white">{selectedTokenActor.name}</h3>
          <p className="text-sm text-stone-400">
            {selectedTokenActor.side === "enemy" ? "Inimigo" : selectedTokenActor.side === "ally" ? "Aliado" : "Neutro"}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-2 text-stone-200">
              HP {selectedTokenActor.showHp ? `${selectedTokenActor.hp}/${selectedTokenActor.maxHp}` : "oculto"}
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-2 text-stone-200">
              CA {selectedTokenActor.showArmor ? selectedTokenActor.armor : "oculta"}
            </div>
          </div>
          <p className="mt-3 text-xs text-stone-400">
            Condições: {selectedTokenActor.conditions.length ? selectedTokenActor.conditions.join(", ") : "nenhuma"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
