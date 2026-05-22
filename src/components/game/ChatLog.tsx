import { Dice5, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { logs } from "@/data/campaign";

export function ChatLog({ title = "Chat e logs", className = "" }: { title?: string; className?: string }) {
  return (
    <div className={`flex h-full min-h-[420px] flex-col ${className}`}>
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <p className="section-title">{title}</p>
          <p className="mt-1 text-xs text-stone-500">Rolagens, dano e mensagens da sessão</p>
        </div>
        <Dice5 className="text-antique" size={18} />
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {logs.map((log) => (
          <div key={log} className="rounded-md border border-white/10 bg-black/30 p-3 text-sm text-stone-200">
            <span className="mr-2 text-antique">•</span>
            <span>{log}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-[1fr_40px] gap-2">
        <input
          className="field"
          placeholder="Mensagem ou rolagem"
        />
        <Button className="h-10 w-10 px-0" type="button" aria-label="Enviar">
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
