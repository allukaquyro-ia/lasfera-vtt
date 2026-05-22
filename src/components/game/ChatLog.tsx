"use client";

import { useState } from "react";
import { Dice5, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/state/SessionContext";

export function ChatLog({ title = "Chat e logs", className = "" }: { title?: string; className?: string }) {
  const [message, setMessage] = useState("");
  const { state, dispatch } = useSession();

  function findActorByCommandName(rawName: string) {
    return state.actors.find((actor) => actor.name.toLowerCase() === rawName.trim().toLowerCase());
  }

  function runCommand(command: string) {
    const parts = command.trim().split(/\s+/);
    const name = parts[0]?.toLowerCase();

    if (name === "/d20") {
      dispatch({ type: "roll-expression", expression: "1d20", label: "d20" });
      return;
    }

    if (name === "/roll") {
      const expression = parts[1];
      if (!expression) {
        dispatch({ type: "add-log", message: "Comando inválido. Use /roll 1d20+5." });
        return;
      }
      dispatch({ type: "roll-expression", expression, label: "rolagem livre" });
      return;
    }

    if (name === "/dano" || name === "/cura") {
      const amount = Number(parts.at(-1));
      const actorName = parts.slice(1, -1).join(" ");
      const actor = findActorByCommandName(actorName);

      if (!actor || !Number.isFinite(amount)) {
        dispatch({ type: "add-log", message: `Comando inválido. Use ${name} nome valor.` });
        return;
      }

      dispatch({ type: name === "/dano" ? "apply-damage" : "apply-healing", actorId: actor.id, amount });
      return;
    }

    dispatch({ type: "add-log", message: "Comando não reconhecido. Use /roll 1d20+5, /d20, /dano nome valor ou /cura nome valor." });
  }

  function sendMessage() {
    const trimmed = message.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("/")) {
      runCommand(trimmed);
      setMessage("");
      return;
    }
    dispatch({ type: "add-log", message: `Mesa: ${trimmed}` });
    setMessage("");
  }

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
        {state.logs.map((log) => (
          <div key={log.id} className="rounded-md border border-white/10 bg-black/30 p-3 text-sm text-stone-200">
            <span className="mr-2 text-antique">•</span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-[1fr_40px] gap-2">
        <input
          className="field"
          placeholder="Mensagem ou rolagem"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <Button className="h-10 w-10 px-0" type="button" aria-label="Enviar" onClick={sendMessage}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
