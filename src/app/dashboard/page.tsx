import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { ChatLog } from "@/components/game/ChatLog";
import { PlayerList } from "@/components/game/PlayerList";
import { TokenBar } from "@/components/game/TokenBar";
import { StatusChip } from "@/components/ui/StatusChip";
import { campaign } from "@/data/campaign";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        <Card className="xl:min-h-[calc(100vh-7.5rem)]">
          <p className="section-title mb-4">Jogadores online</p>
          <PlayerList />
        </Card>

        <div className="space-y-5">
          <Card className="min-h-[500px]">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-title">{campaign.location}</p>
                <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">{campaign.title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">Resumo tatico da sessao atual, preparado para mestre e jogadores acompanharem estado da campanha sem sair da mesa.</p>
              </div>
              <StatusChip tone="ruby">{campaign.phase}</StatusChip>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Ameaca</p>
                <p className="mt-2 font-semibold text-red-100">{campaign.threat}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Objetivo</p>
                <p className="mt-2 text-stone-200">{campaign.objective}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="h-56 rounded-lg border border-antique/20 bg-ruby/10 rune-grid" />
              <div className="space-y-3 rounded-lg border border-white/10 bg-black/25 p-4">
                <p className="section-title text-stone-400">Fila de cena</p>
                {["Explorar obelisco", "Resolver emboscada", "Descansar na caravana"].map((item) => (
                  <div key={item} className="rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm text-stone-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <TokenBar />
        </div>

        <Card className="xl:min-h-[calc(100vh-7.5rem)]">
          <ChatLog title="Chat e logs" />
        </Card>
      </div>
    </AppShell>
  );
}
