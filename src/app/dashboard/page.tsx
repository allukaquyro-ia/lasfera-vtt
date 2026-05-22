import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { ChatLog } from "@/components/game/ChatLog";
import { MapGrid } from "@/components/game/MapGrid";
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

        <div className="min-w-0 space-y-5">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-title">{campaign.location}</p>
                <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">{campaign.title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">Resumo simples da sessão local. Use a mesa, o chat e a iniciativa como centro da partida.</p>
              </div>
              <StatusChip tone="ruby">{campaign.phase}</StatusChip>
            </div>
          </Card>
          <MapGrid />
          <TokenBar />
        </div>

        <Card className="xl:min-h-[calc(100vh-7.5rem)]">
          <ChatLog title="Chat e logs" />
        </Card>
      </div>
    </AppShell>
  );
}
