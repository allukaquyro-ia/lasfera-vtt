import { Brush, Eye, Hand, Ruler, Swords } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ChatLog } from "@/components/game/ChatLog";
import { CharacterSheetDrawer } from "@/components/game/CharacterSheetDrawer";
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
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(340px,400px)]">
        <div className="min-w-0 space-y-4">
          <Card className="flex min-w-0 items-center gap-3 overflow-x-auto">
            <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Ferramentas</p>
            {tools.map((tool) => (
              <Button key={tool.label} className="h-11 w-11 px-0" type="button" variant={tool.label === "Mover" ? "secondary" : "ghost"} aria-label={tool.label} title={tool.label}>
                <tool.icon size={18} />
              </Button>
            ))}
          </Card>
          <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
            <div className="min-w-0 space-y-4">
              <MapGrid />
              <TokenBar />
            </div>
            <TokenDetailsPanel />
          </div>
        </div>
        <Card className="min-w-0 xl:min-h-[calc(100vh-7.5rem)]">
          <ChatLog title="Chat e rolagens" />
        </Card>
      </div>
      <CharacterSheetDrawer />
    </AppShell>
  );
}
