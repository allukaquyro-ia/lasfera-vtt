"use client";

import { useState } from "react";
import { conditionNames } from "@/data/conditions";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { useSession } from "@/state/SessionContext";

export function TokenDetailsPanel() {
  const { selectedTokenActor, dispatch } = useSession();
  const [amount, setAmount] = useState(5);
  const [condition, setCondition] = useState(conditionNames[0]);

  if (!selectedTokenActor) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/25 p-3 text-sm text-stone-400">
        Selecione um token no mapa.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-black/25 p-3">
      <div>
        <p className="section-title">Token selecionado</p>
        <h2 className="mt-1 text-xl font-bold text-white">{selectedTokenActor.name}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusChip tone={selectedTokenActor.side === "enemy" ? "enemy" : selectedTokenActor.side === "ally" ? "ally" : "neutral"}>
            {selectedTokenActor.kind === "character" ? "jogador" : selectedTokenActor.side === "enemy" ? "inimigo" : "aliado"}
          </StatusChip>
          <StatusChip tone="arcane">CA {selectedTokenActor.showArmor ? selectedTokenActor.armor : "oculta"}</StatusChip>
        </div>
      </div>

      <div className="rounded-md border border-white/10 bg-black/30 p-3 text-sm text-stone-200">
        HP {selectedTokenActor.showHp ? `${selectedTokenActor.hp}/${selectedTokenActor.maxHp}` : "oculto"}
        <div className="mt-2 h-2 rounded-full bg-black/50">
          <div className="h-2 rounded-full bg-ruby-bright" style={{ width: `${(selectedTokenActor.hp / selectedTokenActor.maxHp) * 100}%` }} />
        </div>
      </div>

      <p className="text-xs text-stone-400">
        Condições: {selectedTokenActor.conditions.length ? selectedTokenActor.conditions.join(", ") : "nenhuma"}
      </p>

      <input className="field" min={0} type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="danger" onClick={() => dispatch({ type: "apply-damage", actorId: selectedTokenActor.id, amount })}>Dano</Button>
        <Button type="button" variant="secondary" onClick={() => dispatch({ type: "apply-healing", actorId: selectedTokenActor.id, amount })}>Cura</Button>
      </div>
      <div className="grid grid-cols-[1fr_92px] gap-2">
        <select className="field" value={condition} onChange={(event) => setCondition(event.target.value)}>
          {conditionNames.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <Button type="button" variant="ghost" onClick={() => dispatch({ type: "toggle-condition", actorId: selectedTokenActor.id, condition })}>Aplicar</Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="ghost" onClick={() => dispatch({ type: "roll-basic-attack", actorId: selectedTokenActor.id })}>Rolar</Button>
        <Button type="button" variant="ghost" onClick={() => dispatch({ type: "roll-damage", actorId: selectedTokenActor.id })}>Dano rolado</Button>
      </div>
    </div>
  );
}
