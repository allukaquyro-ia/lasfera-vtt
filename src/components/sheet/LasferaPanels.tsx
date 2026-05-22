"use client";

import { useState } from "react";
import { ActionFlowPanel } from "@/components/game/ActionFlowPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { elementsCatalog } from "@/data/lasfera";
import { cn } from "@/lib/utils";
import { useSession } from "@/state/SessionContext";
import type { Blessing, ElementalAbility, InventoryItem, LasferaAbility, LasferaCharacterSheet, LasferaElement } from "@/types/lasfera";

export function GeneralPanel({ sheet, hp, maxHp, armor, conditions, player }: { sheet: LasferaCharacterSheet; hp: number; maxHp: number; armor: number; conditions: string[]; player?: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="grid min-h-64 place-items-center rounded-lg border border-antique/30 bg-ruby/20 text-7xl font-bold text-white shadow-ember">{sheet.portrait}</div>
      <div className="grid gap-3 md:grid-cols-2">
        <Info title="Jogador" value={player ?? "NPC"} />
        <Info title="Raça" value={sheet.race} />
        <Info title="Classe" value={sheet.className} />
        <Info title="Nível" value={String(sheet.level)} />
        <Info title="Antecedente" value={sheet.background} />
        <Info title="HP / CA" value={`${hp}/${maxHp} | CA ${armor}`} />
        <Info title="Elemento principal" value={`${sheet.primaryElement} nv. ${sheet.elementalLevel}`} />
        <Info title="Bênção principal" value={sheet.blessings[0]?.name ?? "Nenhuma"} />
        <div className="rounded-lg border border-white/10 bg-black/25 p-4 md:col-span-2">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Condições</p>
          <p className="mt-2 text-stone-200">{conditions.length ? conditions.join(", ") : "Nenhuma"}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-4 md:col-span-2">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Resumo</p>
          <p className="mt-2 leading-6 text-stone-200">{sheet.summary}</p>
        </div>
      </div>
    </div>
  );
}

export function ElementsPanel({ sheet }: { sheet: LasferaCharacterSheet }) {
  const [selected, setSelected] = useState<LasferaElement | ElementalAbility>(sheet.absorbedElements[0]);
  const ownedNames = new Set(sheet.absorbedElements.map((element) => element.name));

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
          <p className="section-title">Árvore elemental</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {elementsCatalog.map((element) => (
              <button
                key={element.name}
                className={cn("rounded-lg border p-4 text-left transition hover:border-antique/50", ownedNames.has(element.name) ? toneClass(element.tone) : "border-white/10 bg-black/25 text-stone-500")}
                onClick={() => setSelected(sheet.absorbedElements.find((item) => item.name === element.name) ?? element)}
                type="button"
              >
                <p className="font-bold text-white">{element.name}</p>
                <p className="mt-1 text-xs text-stone-400">{ownedNames.has(element.name) ? `nível ${sheet.absorbedElements.find((item) => item.name === element.name)?.level}` : "não absorvido"}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {sheet.elementalAbilities.map((ability) => (
            <button key={ability.id} className="rounded-lg border border-white/10 bg-black/25 p-4 text-left hover:border-antique/40" onClick={() => setSelected(ability)} type="button">
              <p className="font-bold text-white">{ability.name}</p>
              <p className="mt-1 text-xs text-antique">{ability.element} | {ability.cost}</p>
              <p className="mt-2 text-sm text-stone-400">{ability.description}</p>
            </button>
          ))}
        </div>
      </div>
      <DetailPanel title={"element" in selected ? selected.name : selected.name} subtitle={"element" in selected ? selected.element : selected.description}>
        {"element" in selected ? (
          <>
            <p>{selected.description}</p>
            <p>Dano: {selected.damage ?? "n/a"} | Cura: {selected.healing ?? "n/a"}</p>
          </>
        ) : (
          <>
            <p>{selected.description}</p>
            <p>Habilidades: {selected.unlockedAbilities.join(", ")}</p>
          </>
        )}
        <p className="mt-3">Fusões: {sheet.mysticFusions.join(" | ")}</p>
      </DetailPanel>
    </div>
  );
}

export function BlessingsPanel({ sheet, actorName }: { sheet: LasferaCharacterSheet; actorName: string }) {
  const { dispatch } = useSession();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sheet.blessings.map((blessing) => (
        <Card key={blessing.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-title">{blessing.deity}</p>
              <h3 className="mt-1 text-2xl font-bold text-white">{blessing.name}</h3>
            </div>
            <StatusChip tone="ruby">estágio {blessing.stage}</StatusChip>
          </div>
          <div className="mt-4 h-3 rounded-full bg-black/40">
            <div className="h-3 rounded-full bg-antique" style={{ width: `${blessing.progress}%` }} />
          </div>
          <Section title="Efeitos ativos" items={blessing.activeEffects} />
          <Section title="Permanentes" items={blessing.permanentEffects} />
          <p className="mt-3 text-sm leading-6 text-stone-300">{blessing.description}</p>
          <p className="mt-3 text-xs text-stone-500">{blessing.history.join(" | ")}</p>
          <Button className="mt-4 w-full" type="button" variant="secondary" onClick={() => dispatch({ type: "add-log", kind: "system", user: "Mestre", message: `${actorName} ativou estágio ${blessing.stage} da bênção ${blessing.name}.`, lines: blessing.activeEffects })}>
            Ativar estágio
          </Button>
        </Card>
      ))}
    </div>
  );
}

export function InventoryPanel({ sheet }: { sheet: LasferaCharacterSheet }) {
  const [selected, setSelected] = useState<InventoryItem>(sheet.inventory[0]);
  const { dispatch } = useSession();

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Info title="Ouro" value={String(sheet.gold)} />
          <Info title="Pedras mágicas" value={String(sheet.magicStones)} />
          <Info title="Slots ocupados" value={`${sheet.inventory.reduce((sum, item) => sum + item.quantity, 0)}/20`} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {sheet.inventory.map((item) => (
            <button key={item.id} className={cn("rounded-lg border p-4 text-left", selected.id === item.id ? "border-antique/60 bg-antique/10" : "border-white/10 bg-black/25")} onClick={() => setSelected(item)} type="button">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-white">{item.name}</p>
                <StatusChip tone={item.equipped ? "ally" : "neutral"}>{item.equipped ? "equipado" : `x${item.quantity}`}</StatusChip>
              </div>
              <p className="mt-1 text-xs text-stone-400">{item.type} | {item.rarity}</p>
            </button>
          ))}
        </div>
      </div>
      <DetailPanel title={selected.name} subtitle={`${selected.type} | ${selected.rarity}`}>
        <p>{selected.description}</p>
        <p>Quantidade: {selected.quantity}</p>
        <p>{selected.equipped ? "Está equipado." : "Está na mochila."}</p>
        <Button className="mt-4 w-full" type="button" onClick={() => dispatch({ type: "add-log", kind: "system", user: "Mesa", message: `Item usado: ${selected.name}.`, lines: [selected.description] })}>Usar item</Button>
      </DetailPanel>
    </div>
  );
}

export function AbilitiesPanel({ sheet, actorId, actorName }: { sheet: LasferaCharacterSheet; actorId: string; actorName: string }) {
  const { actorsById, dispatch } = useSession();
  const actor = actorsById.get(actorId);

  return (
    <div className="space-y-4">
      {actor ? <ActionFlowPanel sourceActor={actor} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {sheet.abilities.map((ability) => (
          <Card key={ability.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="section-title">{ability.type}</p>
                <h3 className="mt-1 text-xl font-bold text-white">{ability.name}</h3>
              </div>
              <StatusChip tone="arcane">{ability.cost}</StatusChip>
            </div>
            <p className="mt-2 text-sm text-stone-400">Alcance: {ability.range}</p>
            <p className="mt-3 leading-6 text-stone-200">{ability.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button type="button" variant="ghost" onClick={() => dispatch({ type: "add-log", kind: "system", user: actorName, message: `${actorName} preparou ${ability.name}.`, lines: [ability.description, "Use o painel acima para escolher um alvo e aplicar."] })}>Preparar</Button>
              <Button type="button" variant="secondary" onClick={() => ability.damage ? dispatch({ type: "roll-expression", actorId, expression: ability.damage, label: ability.name, user: actorName }) : ability.healing ? dispatch({ type: "roll-expression", actorId, expression: ability.healing, label: ability.name, user: actorName }) : dispatch({ type: "add-log", kind: "system", user: actorName, message: `${ability.name} não possui rolagem configurada.` })}>
                Rolar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{title}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}

function DetailPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <aside className="rounded-lg border border-white/10 bg-black/30 p-4 text-sm leading-6 text-stone-300">
      <p className="section-title">{subtitle}</p>
      <h3 className="mt-1 text-2xl font-bold text-white">{title}</h3>
      <div className="mt-4 space-y-2">{children}</div>
    </aside>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-stone-300">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function toneClass(tone: string) {
  const tones: Record<string, string> = {
    water: "border-blue-300/40 bg-blue-500/15",
    fire: "border-red-300/40 bg-red-500/15",
    earth: "border-amber-300/40 bg-amber-700/15",
    wind: "border-emerald-300/40 bg-emerald-500/15",
    lightning: "border-yellow-200/40 bg-yellow-400/15",
    light: "border-yellow-100/50 bg-yellow-100/10",
    shadow: "border-fuchsia-300/40 bg-fuchsia-900/20",
    ice: "border-cyan-200/40 bg-cyan-300/15",
    magma: "border-orange-300/40 bg-orange-700/20",
  };
  return tones[tone] ?? "border-white/10 bg-black/25";
}
