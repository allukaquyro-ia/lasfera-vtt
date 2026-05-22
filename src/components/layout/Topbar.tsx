import { Bell, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { campaign } from "@/data/campaign";

export function Topbar() {
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-white/10 bg-black/25 px-4 py-3 lg:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-antique">Campanha #{campaign.number}</p>
        <h2 className="text-lg font-bold text-white">{campaign.title}</h2>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <div className="flex h-10 w-64 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-stone-400">
          <Search size={16} />
          Buscar notas, regras, tokens
        </div>
        <Button className="h-10 w-10 px-0" type="button" variant="ghost" aria-label="Notificações">
          <Bell size={17} />
        </Button>
        <Button href="/loading" variant="secondary">
          <Sparkles size={16} />
          Entrar
        </Button>
      </div>
    </header>
  );
}
