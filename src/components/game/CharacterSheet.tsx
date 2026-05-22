"use client";

import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { Tabs } from "@/components/ui/Tabs";
import { useSession } from "@/state/SessionContext";
import type { SessionActor } from "@/types/session";

export function CharacterSheet({ id }: { id: string }) {
  const { actorsById } = useSession();
  const character = actorsById.get(id);

  if (!character) {
    return (
      <Card>
        <h1 className="text-2xl font-bold text-white">Personagem não encontrado</h1>
      </Card>
    );
  }

  const hpPercent = Math.round((character.hp / character.maxHp) * 100);

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card className="xl:min-h-[calc(100vh-7.5rem)]">
        <div className="mb-5 grid h-24 w-24 place-items-center rounded-lg border border-antique/35 bg-ruby/30 text-4xl font-bold text-white shadow-ember">
          {character.name.slice(0, 1)}
        </div>
        <p className="section-title">Nivel {character.level}</p>
        <h1 className="mt-1 text-4xl font-bold text-white">{character.name}</h1>
        <p className="mt-2 text-stone-300">{character.className}</p>

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
            <Info title="Elemento" value={character.element ?? "Sem elemento"} compact />
            <Info title="Jogador" value={character.player ?? "NPC"} compact />
          </div>
        </div>
      </Card>

      <Card className="min-h-[620px]">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-title">Ficha de personagem</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Dados de mesa</h2>
          </div>
          <StatusChip tone="antique">estado local</StatusChip>
        </div>
        <Tabs
          items={[
            {
              label: "Geral",
              content: (
                <div className="grid gap-4 md:grid-cols-2">
                  <Info title="Jogador" value={character.player ?? "NPC"} />
                  <Info title="Elemento" value={character.element ?? "Sem elemento"} />
                  <Info title="Classe" value={character.className} />
                  <Info title="Status" value={character.conditions[0] ?? character.status} />
                </div>
              ),
            },
            {
              label: "Atributos",
              content: (
                <div className="grid gap-3 md:grid-cols-3">
                  {Object.entries(character.attributes ?? {}).map(([name, value]) => (
                    <Info key={name} title={name} value={`+${value}`} />
                  ))}
                </div>
              ),
            },
            { label: "Combate", content: <List items={[`HP ${character.hp}/${character.maxHp}`, `CA ${character.armor}`, "Iniciativa +3", "Ataque principal +6"]} /> },
            { label: "Magias", content: <List items={character.spells ?? []} /> },
            { label: "Inventário", content: <List items={character.inventory ?? []} /> },
            { label: "Elementos", content: <List items={[character.element ?? "Sem elemento", "Afinidade secundaria bloqueada", "Ressonancia instavel"]} /> },
            { label: "Bênçãos", content: <List items={character.blessings ?? []} /> },
            { label: "Anotações", content: <p className="rounded-lg border border-white/10 bg-black/20 p-4 text-stone-200">{character.notes}</p> },
          ]}
        />
      </Card>
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
