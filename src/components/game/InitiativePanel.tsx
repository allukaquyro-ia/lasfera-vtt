"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { conditionNames } from "@/data/conditions";
import { cn } from "@/lib/utils";
import { useSession } from "@/state/SessionContext";

export function InitiativePanel() {
  const { state, selectedTokenActor, dispatch } = useSession();
  const [amount, setAmount] = useState(5);
  const [condition, setCondition] = useState(conditionNames[0]);

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

      <div className="border-t border-white/10 pt-4">
        <p className="section-title mb-3">Ações no selecionado</p>
        {selectedTokenActor ? (
          <div className="space-y-3">
            <div className="rounded-md border border-white/10 bg-black/25 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{selectedTokenActor.name}</p>
                  <p className="text-xs text-stone-500">
                    HP {selectedTokenActor.showHp ? `${selectedTokenActor.hp}/${selectedTokenActor.maxHp}` : "oculto"} | CA {selectedTokenActor.showArmor ? selectedTokenActor.armor : "oculta"}
                  </p>
                </div>
                <StatusChip tone={selectedTokenActor.side === "enemy" ? "enemy" : selectedTokenActor.side === "ally" ? "ally" : "neutral"}>
                  {selectedTokenActor.side}
                </StatusChip>
              </div>
            </div>
            <input className="field" min={0} type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="danger" onClick={() => dispatch({ type: "apply-damage", actorId: selectedTokenActor.id, amount })}>Dano</Button>
              <Button type="button" variant="secondary" onClick={() => dispatch({ type: "apply-healing", actorId: selectedTokenActor.id, amount })}>Cura</Button>
            </div>
            <div className="grid grid-cols-[1fr_112px] gap-2">
              <select className="field" value={condition} onChange={(event) => setCondition(event.target.value)}>
                {conditionNames.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <Button type="button" variant="ghost" onClick={() => dispatch({ type: "toggle-condition", actorId: selectedTokenActor.id, condition })}>Condição</Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="ghost" onClick={() => dispatch({ type: "roll-basic-attack", actorId: selectedTokenActor.id })}>Ataque</Button>
              <Button type="button" variant="ghost" onClick={() => dispatch({ type: "roll-damage", actorId: selectedTokenActor.id })}>Dano rolado</Button>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-white/10 bg-black/25 p-3 text-sm text-stone-400">
            Selecione um token no mapa ou na barra.
          </div>
        )}
      </div>
    </div>
  );
}
