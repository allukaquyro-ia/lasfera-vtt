"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { getActionOptions } from "@/lib/actionOptions";
import { useSession } from "@/state/SessionContext";
import type { SessionActor } from "@/types/session";

export function ActionFlowPanel({ sourceActor }: { sourceActor: SessionActor }) {
  const { state, actorsById, dispatch } = useSession();
  const options = useMemo(() => getActionOptions(sourceActor), [sourceActor]);
  const [actionId, setActionId] = useState(options[0]?.id ?? "");
  const [targetActorId, setTargetActorId] = useState(sourceActor.id);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const selectedAction = options.find((option) => option.id === actionId) ?? options[0];
  const activeActors = state.tokens.map((token) => actorsById.get(token.actorId)).filter((actor): actor is SessionActor => Boolean(actor));
  const target = actorsById.get(targetActorId);

  if (!selectedAction) {
    return null;
  }

  function execute() {
    setLastResult(`${sourceActor.name} resolveu ${selectedAction.name} em ${target?.name ?? "alvo"}. Veja o log no chat.`);
    dispatch({
      type: "execute-table-action",
      action: {
        sourceActorId: sourceActor.id,
        targetActorId,
        type: selectedAction.type,
        name: selectedAction.name,
        attackExpression: selectedAction.attackExpression,
        damageExpression: selectedAction.damageExpression,
        healingExpression: selectedAction.healingExpression,
        condition: selectedAction.condition,
        saveAttribute: selectedAction.saveAttribute,
        saveDc: selectedAction.saveDc,
        halfDamageOnSave: selectedAction.halfDamageOnSave,
        cost: selectedAction.cost,
      },
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-black/25 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-title">Ação rápida</p>
          <h3 className="mt-1 font-bold text-white">{sourceActor.name}</h3>
        </div>
        <StatusChip tone="arcane">{selectedAction.type}</StatusChip>
      </div>

      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
        Ação
        <select className="field mt-2" value={actionId} onChange={(event) => setActionId(event.target.value)}>
          {options.map((option) => (
            <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
        Alvo
        <select className="field mt-2" value={targetActorId} onChange={(event) => setTargetActorId(event.target.value)}>
          {activeActors.map((actor) => (
            <option key={actor.id} value={actor.id}>{actor.name} ({actor.hp}/{actor.maxHp})</option>
          ))}
        </select>
      </label>

      <div className="rounded-md border border-white/10 bg-black/30 p-3 text-sm text-stone-300">
        <p className="font-semibold text-white">{selectedAction.name}</p>
        <p className="mt-1 text-xs text-stone-500">{selectedAction.description}</p>
        <div className="mt-3 space-y-1 text-xs text-antique">
          <p>{selectedAction.attackExpression ? `Ataque contra CA: ${selectedAction.attackExpression}` : "Sem ataque contra CA"}</p>
          <p>{selectedAction.saveDc ? `Resistência: ${selectedAction.saveAttribute} CD ${selectedAction.saveDc}` : "Sem resistência"}</p>
          <p>{selectedAction.damageExpression ? `Dano esperado: ${selectedAction.damageExpression}` : selectedAction.healingExpression ? `Cura esperada: ${selectedAction.healingExpression}` : "Sem dano/cura"}</p>
          <p>{selectedAction.cost ? `Custo: ${selectedAction.cost.amount} ${selectedAction.cost.resource} (${sourceActor.resources[selectedAction.cost.resource]}/${sourceActor.maxResources[selectedAction.cost.resource]})` : "Sem custo"}</p>
          <p>{selectedAction.condition ? `Condição possível: ${selectedAction.condition}` : "Sem condição"}</p>
        </div>
        {target ? <p className="mt-2 text-xs text-stone-400">Alvo: {target.name} HP {target.hp}/{target.maxHp}</p> : null}
      </div>

      {sourceActor.conditions.includes("Atordoado") ? (
        <div className="rounded-md border border-enemy/40 bg-enemy/10 p-2 text-xs text-red-100">
          Atordoado: este ator não pode resolver ação rápida agora.
        </div>
      ) : null}

      {lastResult ? <p className="rounded-md border border-antique/25 bg-antique/10 p-2 text-xs text-stone-200">{lastResult}</p> : null}

      <Button className="w-full" type="button" onClick={execute} disabled={sourceActor.conditions.includes("Atordoado")}>
        Resolver ação
      </Button>
    </div>
  );
}
