import { Plus, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { characters } from "@/data/characters";

export default function MestrePage() {
  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-antique">Painel do Mestre</p>
              <h1 className="mt-1 text-3xl font-bold text-white">Controle de cena</h1>
            </div>
            <Button type="button" variant="secondary">
              <SlidersHorizontal size={16} />
              Configurar
            </Button>
          </div>

          <div className="grid gap-3">
            {characters.map((character) => (
              <div key={character.id} className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_180px_120px] md:items-center">
                <div>
                  <p className="font-semibold text-white">{character.name}</p>
                  <p className="text-sm text-stone-400">{character.className}</p>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-stone-400">
                    <span>HP</span>
                    <span>{character.hp}/{character.maxHp}</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/40">
                    <div className="h-2 rounded-full bg-ruby-bright" style={{ width: `${(character.hp / character.maxHp) * 100}%` }} />
                  </div>
                </div>
                <StatusChip tone={character.side === "ally" ? "ally" : character.side === "enemy" ? "enemy" : "neutral"}>
                  {character.side === "ally" ? "aliado" : character.side === "enemy" ? "inimigo" : "neutro"}
                </StatusChip>
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
            <form className="space-y-3">
              <input className="h-10 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-antique/50" placeholder="Nome da criatura" />
              <div className="grid grid-cols-2 gap-2">
                <input className="h-10 rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-antique/50" placeholder="HP" />
                <input className="h-10 rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-antique/50" placeholder="CA" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="secondary">Aliado</Button>
                <Button type="button" variant="danger">Inimigo</Button>
              </div>
              <Button className="w-full" type="button">
                <Plus size={16} />
                Adicionar mock
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-bold text-white">Visibilidade</h2>
            <label className="mb-3 flex items-center justify-between rounded-md border border-white/10 bg-black/20 p-3 text-sm text-stone-200">
              Mostrar HP
              <input defaultChecked type="checkbox" className="h-5 w-5 accent-rose-700" />
            </label>
            <label className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 p-3 text-sm text-stone-200">
              Mostrar CA
              <input defaultChecked type="checkbox" className="h-5 w-5 accent-rose-700" />
            </label>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
