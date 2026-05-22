import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { Tabs } from "@/components/ui/Tabs";
import { getCharacter } from "@/data/characters";

export default function CharacterPage({ params }: { params: { id: string } }) {
  const character = getCharacter(params.id);

  if (!character) {
    notFound();
  }

  const hpPercent = Math.round((character.hp / character.maxHp) * 100);

  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <div className="mb-5 grid h-24 w-24 place-items-center rounded-lg border border-antique/35 bg-ruby/30 text-4xl font-bold text-white shadow-ember">
            {character.name.slice(0, 1)}
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-antique">Nivel {character.level}</p>
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
            <div className="flex gap-2">
              <StatusChip tone={character.side === "ally" ? "ally" : "neutral"}>{character.status}</StatusChip>
              <StatusChip tone="arcane">CA {character.armor}</StatusChip>
            </div>
          </div>
        </Card>

        <Card>
          <Tabs
            items={[
              {
                label: "Geral",
                content: (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Info title="Jogador" value={character.player} />
                    <Info title="Elemento" value={character.element} />
                    <Info title="Classe" value={character.className} />
                    <Info title="Status" value={character.status} />
                  </div>
                ),
              },
              {
                label: "Atributos",
                content: (
                  <div className="grid gap-3 md:grid-cols-3">
                    {Object.entries(character.attributes).map(([name, value]) => (
                      <Info key={name} title={name} value={`+${value}`} />
                    ))}
                  </div>
                ),
              },
              { label: "Combate", content: <List items={[`HP ${character.hp}/${character.maxHp}`, `CA ${character.armor}`, "Iniciativa +3", "Ataque principal +6"]} /> },
              { label: "Magias", content: <List items={character.spells} /> },
              { label: "Inventário", content: <List items={character.inventory} /> },
              { label: "Elementos", content: <List items={[character.element, "Afinidade secundaria bloqueada", "Ressonancia instavel"]} /> },
              { label: "Bênçãos", content: <List items={character.blessings} /> },
              { label: "Anotações", content: <p className="rounded-lg border border-white/10 bg-black/20 p-4 text-stone-200">{character.notes}</p> },
            ]}
          />
        </Card>
      </div>
    </AppShell>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{title}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div key={item} className="rounded-lg border border-white/10 bg-black/20 p-4 text-stone-200">
          {item}
        </div>
      ))}
    </div>
  );
}
