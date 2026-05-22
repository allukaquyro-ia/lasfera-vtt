import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { logs } from "@/data/campaign";

export function ChatLog() {
  return (
    <div className="flex h-full min-h-80 flex-col">
      <div className="flex-1 space-y-3">
        {logs.map((log) => (
          <div key={log} className="rounded-md border border-white/10 bg-black/20 p-3 text-sm text-stone-200">
            {log}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          className="h-10 min-w-0 flex-1 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-antique/50"
          placeholder="Mensagem ou rolagem"
        />
        <Button className="h-10 w-10 px-0" type="button" aria-label="Enviar">
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
