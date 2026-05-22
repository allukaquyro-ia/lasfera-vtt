"use client";

import { FormEvent, useState } from "react";
import { Minus, Plus, ShieldAlert, Skull, SlidersHorizontal, Swords, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { InitiativePanel } from "@/components/game/InitiativePanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { conditionNames } from "@/data/conditions";
import { useSession } from "@/state/SessionContext";
import type { CreatureInput } from "@/types/session";

const initialCreature: CreatureInput = {
  name: "",
  level: 1,
  hp: 12,
  armor: 12,
  side: "enemy",
  showHp: true,
  showArmor: true,
};

export default function MestrePage() {
  const { state, dispatch } = useSession();
  const [creature, setCreature] = useState<CreatureInput>(initialCreature);

  function createCreature(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({
      type: "create-creature",
      creature: {
        ...creature,
        level: Math.max(1, creature.level),
        hp: Math.max(1, creature.hp),
        armor: Math.max(1, creature.armor),
      },
    });
    setCreature(initialCreature);
  }

  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <Card className="xl:min-h-[calc(100vh-7.5rem)]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-title">Painel do Mestre</p>
              <h1 className="mt-1 text-3xl font-bold text-white">Controle de cena</h1>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="danger" onClick={() => dispatch({ type: "start-combat" })}>
                <Swords size={16} />
                Iniciar combate
              </Button>
              <Button className="h-10 w-10 px-0" type="button" variant="ghost" aria-label="Configurar">
                <SlidersHorizontal size={16} />
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {state.actors.map((actor) => (
              <div key={actor.id} className="grid gap-3 rounded-lg border border-white/10 bg-black/25 p-4 md:grid-cols-[1fr_190px_132px_112px] md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{actor.name}</p>
                    <button
                      className={actor.online ? "h-2.5 w-2.5 rounded-full bg-ally" : "h-2.5 w-2.5 rounded-full bg-stone-600"}
                      onClick={() => dispatch({ type: "toggle-online", actorId: actor.id })}
                      title="Alternar online/offline"
                      type="button"
                    />
                  </div>
                  <p className="text-sm text-stone-400">{actor.className}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {conditionNames.slice(0, 6).map((condition) => (
                      <button
                        key={condition}
                        className={actor.conditions.includes(condition) ? "rounded-full border border-antique/50 bg-antique/15 px-2 py-0.5 text-[11px] text-antique" : "rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-stone-500"}
                        onClick={() => dispatch({ type: "toggle-condition", actorId: actor.id, condition })}
                        type="button"
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-stone-400">
                    <span>HP</span>
                    <span>{actor.hp}/{actor.maxHp}</span>
                  </div>
                  <input
                    aria-label={`HP atual de ${actor.name}`}
                    className="field h-9"
                    max={actor.maxHp}
                    min={0}
                    onChange={(event) => dispatch({ type: "set-hp", actorId: actor.id, hp: Number(event.target.value) })}
                    type="number"
                    value={actor.hp}
                  />
                </div>
                <StatusChip tone={actor.side === "ally" ? "ally" : actor.side === "enemy" ? "enemy" : "neutral"}>
                  {actor.side === "ally" ? "aliado" : actor.side === "enemy" ? "inimigo" : "neutro"}
                </StatusChip>
                <div className="flex gap-2">
                  <Button className="h-9 w-9 px-0" type="button" variant="ghost" aria-label={`Reduzir HP de ${actor.name}`} onClick={() => dispatch({ type: "adjust-hp", actorId: actor.id, delta: -1 })}>
                    <Minus size={15} />
                  </Button>
                  <Button className="h-9 w-9 px-0" type="button" variant="ghost" aria-label={`Aumentar HP de ${actor.name}`} onClick={() => dispatch({ type: "adjust-hp", actorId: actor.id, delta: 1 })}>
                    <Plus size={15} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <ShieldAlert className="text-antique" size={20} />
              <h2 className="text-lg font-bold text-white">Criatura rapida</h2>
            </div>
            <form className="space-y-3" onSubmit={createCreature}>
              <input className="field" placeholder="Nome da criatura" value={creature.name} onChange={(event) => setCreature((current) => ({ ...current, name: event.target.value }))} />
              <div className="grid grid-cols-3 gap-2">
                <input className="field" min={1} placeholder="ND" type="number" value={creature.level} onChange={(event) => setCreature((current) => ({ ...current, level: Number(event.target.value) }))} />
                <input className="field" min={1} placeholder="HP" type="number" value={creature.hp} onChange={(event) => setCreature((current) => ({ ...current, hp: Number(event.target.value) }))} />
                <input className="field" min={1} placeholder="CA" type="number" value={creature.armor} onChange={(event) => setCreature((current) => ({ ...current, armor: Number(event.target.value) }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={creature.side === "ally" ? "secondary" : "ghost"} onClick={() => setCreature((current) => ({ ...current, side: "ally" }))}>
                  <UserPlus size={16} />
                  Aliado
                </Button>
                <Button type="button" variant={creature.side === "enemy" ? "danger" : "ghost"} onClick={() => setCreature((current) => ({ ...current, side: "enemy" }))}>
                  <Skull size={16} />
                  Inimigo
                </Button>
              </div>
              <label className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 p-3 text-sm text-stone-200">
                Mostrar HP para jogadores
                <input checked={creature.showHp} type="checkbox" className="h-5 w-5 accent-rose-700" onChange={(event) => setCreature((current) => ({ ...current, showHp: event.target.checked }))} />
              </label>
              <label className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 p-3 text-sm text-stone-200">
                Mostrar CA para jogadores
                <input checked={creature.showArmor} type="checkbox" className="h-5 w-5 accent-rose-700" onChange={(event) => setCreature((current) => ({ ...current, showArmor: event.target.checked }))} />
              </label>
              <Button className="w-full" type="submit">
                <Plus size={16} />
                Criar e Spawnar
              </Button>
            </form>
          </Card>

          <Card>
            <InitiativePanel />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
