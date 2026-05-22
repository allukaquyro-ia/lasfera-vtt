"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { Tabs } from "@/components/ui/Tabs";
import { AbilitiesPanel, BlessingsPanel, ElementsPanel, GeneralPanel, InventoryPanel } from "@/components/sheet/LasferaPanels";
import { conditions } from "@/data/conditions";
import { lasferaSheets } from "@/data/lasfera";
import { attributes, calculateModifiers, skills } from "@/lib/rules";
import { useSession } from "@/state/SessionContext";
import type { SessionActor } from "@/types/session";

export function CharacterSheet({ id }: { id: string }) {
  const { state, actorsById, dispatch } = useSession();
  const character = actorsById.get(id);

  if (!character) {
    return (
      <Card>
        <h1 className="text-2xl font-bold text-white">Personagem não encontrado</h1>
      </Card>
    );
  }

  const hpPercent = Math.round((character.hp / character.maxHp) * 100);
  const sheet = lasferaSheets[id];
  const currentTurn = state.combat.order[state.combat.turnIndex];
  const isOwnTurn = state.combat.active && currentTurn?.actorId === character.id;

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card className="xl:min-h-[calc(100vh-7.5rem)]">
        <div className="mb-5 grid h-24 w-24 place-items-center rounded-lg border border-antique/35 bg-ruby/30 text-4xl font-bold text-white shadow-ember">
          {character.name.slice(0, 1)}
        </div>
          <p className="section-title">Nível {sheet?.level ?? character.level}</p>
          <h1 className="mt-1 text-4xl font-bold text-white">{character.name}</h1>
          <p className="mt-2 text-stone-300">{sheet?.className ?? character.className}</p>

        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-stone-400">HP</span>
              <span className="font-semibold text-white">{character.hp}/{character.maxHp}</span>
            </div>
            <div className="h-3 rounded-full bg-black/40">
              <div className="h-3 rounded-full bg-ruby-bright" style={{ width: `${hpPercent}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusChip tone={character.online ? "ally" : "neutral"}>{character.online ? "online" : "offline"}</StatusChip>
            <StatusChip tone="arcane">CA {character.armor}</StatusChip>
            {character.conditions.map((condition) => (
              <StatusChip key={condition} tone="ruby">{condition}</StatusChip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Info title="Elemento" value={sheet?.primaryElement ?? character.element ?? "Sem elemento"} compact />
            <Info title="Jogador" value={character.player ?? "NPC"} compact />
          </div>
          <div className="pt-2">
            <QuickNumberActions actorId={character.id} />
          </div>
          {state.combat.active ? (
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Combate</p>
              <p className="mt-1 text-sm text-stone-200">{isOwnTurn ? "É o seu turno." : `Aguardando turno: ${currentTurn?.name ?? "-"}`}</p>
              <Button className="mt-3 w-full" type="button" variant={isOwnTurn ? "secondary" : "ghost"} disabled={!isOwnTurn} onClick={() => dispatch({ type: "pass-turn", actorId: character.id })}>
                {isOwnTurn ? "Passar turno" : "Aguardando turno"}
              </Button>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="min-h-[620px]">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-title">Ficha de Lasfera</p>
            <h2 className="mt-1 text-2xl font-bold text-white">{character.name}</h2>
          </div>
          <StatusChip tone="antique">estado local</StatusChip>
        </div>
        <Tabs
          items={[
            {
              label: "Geral",
              content: sheet ? <GeneralPanel sheet={sheet} hp={character.hp} maxHp={character.maxHp} armor={character.armor} conditions={character.conditions} player={character.player} /> : <FallbackGeneral character={character} />,
            },
            {
              label: "Atributos",
              content: <AttributeGrid character={character} />,
            },
            {
              label: "Combate",
              content: (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button type="button" onClick={() => dispatch({ type: "roll-basic-attack", actorId: character.id })}>Ataque básico</Button>
                    <Button type="button" variant="secondary" onClick={() => dispatch({ type: "roll-damage", actorId: character.id })}>Rolar dano</Button>
                  </div>
                  <List items={[`HP ${character.hp}/${character.maxHp}`, `CA ${character.armor}`, `Bônus de proficiência +${character.proficiencyBonus}`, `Dano ${character.damageExpression}`]} />
                </div>
              ),
            },
            { label: "Magias", content: sheet ? <AbilitiesPanel sheet={sheet} actorId={character.id} actorName={character.name} /> : <List items={character.spells ?? []} /> },
            { label: "Inventário", content: sheet ? <InventoryPanel sheet={sheet} /> : <List items={character.inventory ?? []} /> },
            { label: "Elementos", content: sheet ? <ElementsPanel sheet={sheet} /> : <List items={[character.element ?? "Sem elemento", "Afinidade secundaria bloqueada", "Ressonancia instavel"]} /> },
            { label: "Bênçãos", content: sheet ? <BlessingsPanel sheet={sheet} actorName={character.name} /> : <List items={character.blessings ?? []} /> },
            {
              label: "Anotações",
              content: (
                <div className="space-y-4">
                  <p className="rounded-lg border border-white/10 bg-black/20 p-4 text-stone-200">{sheet?.notes ?? character.notes}</p>
                  <ConditionActions actorId={character.id} activeConditions={character.conditions} />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

function FallbackGeneral({ character }: { character: SessionActor }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Info title="Jogador" value={character.player ?? "NPC"} />
      <Info title="Elemento" value={character.element ?? "Sem elemento"} />
      <Info title="Classe" value={character.className} />
      <Info title="Status" value={character.conditions[0] ?? character.status} />
    </div>
  );
}

function AttributeGrid({ character }: { character: SessionActor }) {
  const { dispatch } = useSession();
  const modifiers = calculateModifiers(character.attributeScores);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        {attributes.map((attribute) => (
          <div key={attribute.key} className="rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{attribute.shortLabel}</p>
                <p className="mt-1 text-lg font-semibold text-white">{character.attributeScores[attribute.key]}</p>
                <p className="text-sm text-antique">{modifiers[attribute.key] >= 0 ? "+" : ""}{modifiers[attribute.key]}</p>
              </div>
              <div className="grid gap-2">
                <Button className="h-8 px-2 text-xs" type="button" variant="ghost" onClick={() => dispatch({ type: "roll-attribute", actorId: character.id, attribute: attribute.key })}>Teste</Button>
                <Button className="h-8 px-2 text-xs" type="button" variant="ghost" onClick={() => dispatch({ type: "roll-save", actorId: character.id, attribute: attribute.key })}>Resist.</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div>
        <p className="section-title mb-3">Perícias principais</p>
        <div className="grid gap-2 md:grid-cols-2">
          {skills.slice(0, 8).map((skill) => (
            <Button key={skill.key} className="justify-between" type="button" variant={character.skillProficiencies[skill.key] ? "secondary" : "ghost"} onClick={() => dispatch({ type: "roll-skill", actorId: character.id, skill: skill.key })}>
              {skill.label}
              <span className="text-xs text-stone-400">{skill.attribute}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickNumberActions({ actorId }: { actorId: string }) {
  const { dispatch } = useSession();

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" variant="danger" onClick={() => dispatch({ type: "apply-damage", actorId, amount: 5 })}>Dano 5</Button>
      <Button type="button" variant="secondary" onClick={() => dispatch({ type: "apply-healing", actorId, amount: 5 })}>Cura 5</Button>
    </div>
  );
}

function ConditionActions({ actorId, activeConditions }: { actorId: string; activeConditions: string[] }) {
  const { dispatch } = useSession();

  return (
    <div>
      <p className="section-title mb-3">Condições padronizadas</p>
      <div className="grid gap-2 md:grid-cols-2">
        {conditions.map((condition) => (
          <button
            key={condition.name}
            className={activeConditions.includes(condition.name) ? "rounded-md border border-antique/50 bg-antique/15 p-3 text-left text-sm text-antique" : "rounded-md border border-white/10 bg-black/25 p-3 text-left text-sm text-stone-300"}
            onClick={() => dispatch({ type: "toggle-condition", actorId, condition: condition.name })}
            type="button"
          >
            <span className="font-semibold">{condition.name}</span>
            <span className="mt-1 block text-xs text-stone-500">{condition.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Info({ title, value, compact = false }: { title: string; value: string; compact?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{title}</p>
      <p className={compact ? "mt-2 text-sm font-semibold text-white" : "mt-2 text-lg font-semibold text-white"}>{value}</p>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  if (!items.length) {
    return <div className="rounded-lg border border-white/10 bg-black/25 p-4 text-stone-400">Nenhuma entrada mockada.</div>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div key={item} className="rounded-lg border border-white/10 bg-black/25 p-4 text-stone-200">
          {item}
        </div>
      ))}
    </div>
  );
}
