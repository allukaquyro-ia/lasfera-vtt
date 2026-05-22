import { Brush, Eye, Hand, Ruler, Swords } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ChatLog } from "@/components/game/ChatLog";
import { MapGrid } from "@/components/game/MapGrid";
import { TokenBar } from "@/components/game/TokenBar";
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
      <div className="grid gap-5 xl:grid-cols-[76px_minmax(0,1fr)_330px]">
        <Card className="flex xl:min-h-[620px] xl:flex-col">
          <div className="flex gap-2 xl:flex-col">
            {tools.map((tool) => (
              <Button key={tool.label} className="h-11 w-11 px-0" type="button" variant="ghost" aria-label={tool.label} title={tool.label}>
                <tool.icon size={18} />
              </Button>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <MapGrid />
          <TokenBar />
        </div>
        <Card>
          <h2 className="mb-4 text-lg font-bold text-white">Chat e rolagens</h2>
          <ChatLog />
        </Card>
      </div>
    </AppShell>
  );
}
