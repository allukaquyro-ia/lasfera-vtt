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
  const selectedAction = options.find((option) => option.id === actionId) ?? options[0];
  const activeActors = state.tokens.map((token) => actorsById.get(token.actorId)).filter((actor): actor is SessionActor => Boolean(actor));
  const target = actorsById.get(targetActorId);

  if (!selectedAction) {
    return null;
  }

  function execute() {
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
        <p className="mt-2 text-xs text-antique">
          {selectedAction.attackExpression ? `Ataque ${selectedAction.attackExpression}` : "Sem ataque"}{" | "}
          {selectedAction.damageExpression ? `Dano ${selectedAction.damageExpression}` : selectedAction.healingExpression ? `Cura ${selectedAction.healingExpression}` : "Sem rolagem de efeito"}
        </p>
        {target ? <p className="mt-2 text-xs text-stone-400">Alvo: {target.name} HP {target.hp}/{target.maxHp}</p> : null}
      </div>

      <Button className="w-full" type="button" onClick={execute}>
        Usar em alvo
      </Button>
    </div>
  );
}
