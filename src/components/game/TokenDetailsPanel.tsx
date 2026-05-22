"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { ActionFlowPanel } from "@/components/game/ActionFlowPanel";
import { conditionNames } from "@/data/conditions";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { useSession } from "@/state/SessionContext";
import { useUi } from "@/state/UiContext";

export function TokenDetailsPanel() {
  const { selectedTokenActor, dispatch } = useSession();
  const { openCharacterSheet } = useUi();
  const [amount, setAmount] = useState(5);
  const [condition, setCondition] = useState(conditionNames[0]);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    setMinimized(false);
  }, [selectedTokenActor?.id]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dispatch({ type: "clear-selection" });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  if (!selectedTokenActor) {
    return null;
  }

  if (minimized) {
    return (
      <aside className="fixed inset-x-3 bottom-3 z-30 rounded-lg border border-antique/30 bg-black/90 p-3 shadow-ember backdrop-blur 2xl:sticky 2xl:top-0 2xl:inset-auto 2xl:self-start">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="section-title">Selecionado</p>
            <p className="truncate font-semibold text-white">{selectedTokenActor.name}</p>
          </div>
          <div className="flex gap-2">
            <Button className="h-9 w-9 px-0" type="button" variant="ghost" aria-label="Expandir painel" onClick={() => setMinimized(false)}>
              <ChevronUp size={16} />
            </Button>
            <Button className="h-9 w-9 px-0" type="button" variant="ghost" aria-label="Limpar seleção" onClick={() => dispatch({ type: "clear-selection" })}>
              <X size={16} />
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed inset-x-3 bottom-3 z-30 max-h-[72vh] overflow-y-auto rounded-lg border border-antique/30 bg-black/90 p-3 shadow-ember backdrop-blur 2xl:sticky 2xl:top-0 2xl:inset-auto 2xl:max-h-[calc(100vh-11rem)] 2xl:w-full 2xl:self-start">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="section-title">Token selecionado</p>
            <h2 className="mt-1 truncate text-xl font-bold text-white">{selectedTokenActor.name}</h2>
          </div>
          <div className="flex gap-2">
            <Button className="h-9 w-9 px-0" type="button" variant="ghost" aria-label="Minimizar painel" onClick={() => setMinimized(true)}>
              <ChevronDown size={16} />
            </Button>
            <Button className="h-9 w-9 px-0" type="button" variant="ghost" aria-label="Limpar seleção" onClick={() => dispatch({ type: "clear-selection" })}>
              <X size={16} />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusChip tone={selectedTokenActor.side === "enemy" ? "enemy" : selectedTokenActor.side === "ally" ? "ally" : "neutral"}>
            {selectedTokenActor.kind === "character" ? "jogador" : selectedTokenActor.side === "enemy" ? "inimigo" : "aliado"}
          </StatusChip>
          <StatusChip tone="arcane">CA {selectedTokenActor.showArmor ? selectedTokenActor.armor : "oculta"}</StatusChip>
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

        <div className="grid grid-cols-2 gap-2 text-xs text-stone-300">
          {Object.entries(selectedTokenActor.resources).map(([resource, value]) => (
            <div key={resource} className="rounded-md border border-white/10 bg-black/30 p-2">
              <span className="capitalize">{resource}</span>: {value}/{selectedTokenActor.maxResources[resource as keyof typeof selectedTokenActor.maxResources]}
            </div>
          ))}
        </div>

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
        {selectedTokenActor.kind === "character" ? (
          <Button className="w-full" type="button" variant="secondary" onClick={() => openCharacterSheet(selectedTokenActor.id)}>
            Abrir ficha
          </Button>
        ) : null}
        <ActionFlowPanel sourceActor={selectedTokenActor} />
      </div>
    </aside>
  );
}
