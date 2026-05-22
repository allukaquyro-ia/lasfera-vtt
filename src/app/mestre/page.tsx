import { Minus, Plus, ShieldAlert, Skull, SlidersHorizontal, Swords, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { characters } from "@/data/characters";

export default function MestrePage() {
  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="xl:min-h-[calc(100vh-7.5rem)]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-title">Painel do Mestre</p>
              <h1 className="mt-1 text-3xl font-bold text-white">Controle de cena</h1>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="danger">
                <Swords size={16} />
                Iniciar combate
              </Button>
              <Button className="h-10 w-10 px-0" type="button" variant="ghost" aria-label="Configurar">
                <SlidersHorizontal size={16} />
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {characters.map((character) => (
              <div key={character.id} className="grid gap-3 rounded-lg border border-white/10 bg-black/25 p-4 md:grid-cols-[1fr_190px_132px_112px] md:items-center">
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
                <div className="flex gap-2">
                  <Button className="h-9 w-9 px-0" type="button" variant="ghost" aria-label={`Reduzir HP de ${character.name}`}>
                    <Minus size={15} />
                  </Button>
                  <Button className="h-9 w-9 px-0" type="button" variant="ghost" aria-label={`Aumentar HP de ${character.name}`}>
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
            <form className="space-y-3">
              <input className="field" placeholder="Nome da criatura" />
              <div className="grid grid-cols-2 gap-2">
                <input className="field" placeholder="HP" />
                <input className="field" placeholder="CA" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="secondary">
                  <UserPlus size={16} />
                  Aliado
                </Button>
                <Button type="button" variant="danger">
                  <Skull size={16} />
                  Inimigo
                </Button>
              </div>
              <Button className="w-full" type="button">
                <Plus size={16} />
                Spawnar token
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-bold text-white">Status rapido</h2>
            <div className="grid grid-cols-2 gap-2">
              {["Sangrando", "Atordoado", "Oculto", "Marcado"].map((status) => (
                <Button key={status} type="button" variant="ghost">
                  {status}
                </Button>
              ))}
            </div>
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
