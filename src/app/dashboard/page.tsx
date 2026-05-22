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
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <Card>
          <h2 className="mb-4 text-lg font-bold text-white">Jogadores online</h2>
          <PlayerList />
        </Card>

        <div className="space-y-5">
          <Card className="min-h-96">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-antique">{campaign.location}</p>
                <h1 className="mt-2 text-4xl font-bold text-white">{campaign.title}</h1>
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
            <div className="mt-6 h-48 rounded-lg border border-antique/20 bg-ruby/10 rune-grid" />
          </Card>
          <TokenBar />
        </div>

        <Card>
          <h2 className="mb-4 text-lg font-bold text-white">Chat e logs</h2>
          <ChatLog />
        </Card>
      </div>
    </AppShell>
  );
}
