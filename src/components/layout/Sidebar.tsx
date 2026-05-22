import { BookOpen, Dice5, LayoutDashboard, Shield, Swords, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { characters } from "@/data/characters";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mesa", label: "Mesa", icon: Dice5 },
  { href: "/personagem/lilith", label: "Ficha", icon: UserRound },
  { href: "/mestre", label: "Mestre", icon: Shield },
  { href: "/biblioteca", label: "Biblioteca", icon: BookOpen },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-white/10 bg-black/45 px-4 py-5 lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-md border border-antique/40 bg-ruby/30">
          <Swords className="text-antique" size={22} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-antique">Lasfera</p>
          <h1 className="text-lg font-bold text-white">VTT</h1>
        </div>
      </div>

      <nav className="space-y-2" aria-label="Navegação principal">
        {navItems.map((item) => (
          <Button key={item.href} className="w-full justify-start" href={item.href} variant="ghost">
            <item.icon size={17} />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.035] p-3">
        <p className="mb-3 section-title text-stone-400">Grupo</p>
        <div className="space-y-2">
          {characters.map((character) => (
            <div key={character.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm">
              <span className="text-stone-200">{character.name}</span>
              <span className={character.online ? "h-2 w-2 rounded-full bg-ally" : "h-2 w-2 rounded-full bg-stone-600"} />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
