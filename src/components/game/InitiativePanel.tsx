"use client";

import { ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { cn } from "@/lib/utils";
import { useSession } from "@/state/SessionContext";

export function InitiativePanel() {
  const { state, dispatch } = useSession();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-title">Iniciativa</p>
          <p className="mt-1 text-xs text-stone-500">
            {state.combat.active ? "Combate em andamento" : "Nenhum combate ativo"}
          </p>
        </div>
        <StatusChip tone={state.combat.active ? "ruby" : "neutral"}>
          {state.combat.active ? "ativo" : "off"}
        </StatusChip>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {state.combat.order.length ? (
          state.combat.order.map((entry, index) => (
            <div
              key={entry.actorId}
              className={cn(
                "flex items-center justify-between rounded-md border border-white/10 bg-black/25 p-3 text-sm",
                state.combat.active && index === state.combat.turnIndex && "border-antique/60 bg-antique/10",
              )}
            >
              <div>
                <p className="font-semibold text-white">{entry.name}</p>
                <p className="text-xs text-stone-500">d20 {entry.roll} + {entry.modifier}</p>
              </div>
              <span className="text-lg font-bold text-antique">{entry.total}</span>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-white/10 bg-black/25 p-3 text-sm text-stone-400">
            Inicie combate para gerar a ordem.
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button type="button" variant="ghost" onClick={() => dispatch({ type: "previous-turn" })}>
          <ChevronLeft size={16} />
          Voltar
        </Button>
        <Button type="button" variant="secondary" onClick={() => dispatch({ type: "next-turn" })}>
          <ChevronRight size={16} />
          Próximo
        </Button>
        <Button type="button" variant="danger" onClick={() => dispatch({ type: "end-combat" })}>
          <XCircle size={16} />
          Fim
        </Button>
      </div>
    </div>
  );
}
