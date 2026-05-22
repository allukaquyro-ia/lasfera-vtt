import { Brush, Eye, Hand, Ruler, Swords } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ChatLog } from "@/components/game/ChatLog";
import { MapGrid } from "@/components/game/MapGrid";
import { TokenBar } from "@/components/game/TokenBar";
import { TokenDetailsPanel } from "@/components/game/TokenDetailsPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const tools = [
  { label: "Mover", icon: Hand },
  { label: "Medir", icon: Ruler },
  { label: "Marcar", icon: Brush },
  { label: "Visao", icon: Eye },
  { label: "Combate", icon: Swords },
];

export default function MesaPage() {
  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_380px]">
        <Card className="flex xl:min-h-[calc(100vh-7.5rem)] xl:flex-col">
          <p className="mb-3 hidden text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 xl:block">Ferramentas</p>
          <div className="flex gap-2 xl:flex-col">
            {tools.map((tool) => (
              <Button key={tool.label} className="h-11 w-11 px-0" type="button" variant={tool.label === "Mover" ? "secondary" : "ghost"} aria-label={tool.label} title={tool.label}>
                <tool.icon size={18} />
              </Button>
            ))}
          </div>
          <div className="mt-4 min-w-0 flex-1">
            <TokenDetailsPanel />
          </div>
        </Card>
        <div className="space-y-4">
          <MapGrid />
          <TokenBar />
        </div>
        <Card className="xl:min-h-[calc(100vh-7.5rem)]">
          <ChatLog title="Chat e rolagens" />
        </Card>
      </div>
    </AppShell>
  );
}
