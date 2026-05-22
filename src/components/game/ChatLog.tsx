"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Dice5, HeartPulse, Send, ShieldAlert, Swords } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useSession } from "@/state/SessionContext";
import type { LogEntry } from "@/types/session";

export function ChatLog({ title = "Chat e logs", className = "" }: { title?: string; className?: string }) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { state, selectedTokenActor, dispatch } = useSession();

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [state.logs.length]);

  function findActorByCommandName(rawName: string) {
    return state.actors.find((actor) => actor.name.toLowerCase() === rawName.trim().toLowerCase());
  }

  function runCommand(command: string) {
    const parts = command.trim().split(/\s+/);
    const name = parts[0]?.toLowerCase();

    if (name === "/d20") {
      dispatch({ type: "roll-expression", expression: "1d20", label: "d20", user: selectedTokenActor?.name ?? "Lilith", command });
      return;
    }

    if (name === "/roll") {
      const expression = parts[1];
      if (!expression) {
        dispatch({ type: "add-log", kind: "error", user: "Mestre", command, message: "Comando inválido.", lines: ["Use /roll 1d20+5."] });
        return;
      }
      dispatch({ type: "roll-expression", actorId: selectedTokenActor?.id, expression, label: "rolagem livre", user: selectedTokenActor?.name ?? "Lilith", command });
      return;
    }

    if (name === "/dano" || name === "/cura") {
      const amount = Number(parts.at(-1));
      const actorName = parts.slice(1, -1).join(" ");
      const actor = findActorByCommandName(actorName);

      if (!actor || !Number.isFinite(amount)) {
        dispatch({ type: "add-log", kind: "error", user: "Mestre", command, message: "Comando inválido.", lines: [`Use ${name} nome valor.`] });
        return;
      }

      dispatch({ type: name === "/dano" ? "apply-damage" : "apply-healing", actorId: actor.id, amount, user: "Mestre", command });
      return;
    }

    dispatch({
      type: "add-log",
      kind: "error",
      user: "Mestre",
      command,
      message: "Comando não reconhecido.",
      lines: ["Use /roll 1d20+5, /d20, /dano nome valor ou /cura nome valor."],
    });
  }

  function sendMessage() {
    const trimmed = message.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("/")) {
      runCommand(trimmed);
      setMessage("");
      return;
    }
    dispatch({ type: "add-log", kind: "message", user: selectedTokenActor?.name ?? "Mesa", message: trimmed });
    setMessage("");
  }

  return (
    <div className={cn("flex h-[calc(100vh-9.5rem)] min-h-[460px] flex-col overflow-hidden", className)}>
      <div className="shrink-0 border-b border-white/10 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-title">{title}</p>
            <p className="mt-1 text-xs text-stone-500">Comandos, rolagens e eventos da sessão</p>
          </div>
          <Dice5 className="text-antique" size={18} />
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain py-3 pr-1">
        {state.logs.map((log) => (
          <ChatMessageCard key={log.id} log={log} />
        ))}
      </div>

      <div className="shrink-0 border-t border-white/10 pt-3">
        <div className="grid grid-cols-[1fr_40px] gap-2">
          <input
            className="field"
            placeholder="/roll 1d20+5, /dano Nero 12..."
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
    </div>
  );
}

function ChatMessageCard({ log }: { log: LogEntry }) {
  const Icon = log.kind === "roll" ? Dice5 : log.kind === "damage" ? Swords : log.kind === "healing" ? HeartPulse : log.kind === "error" ? AlertTriangle : ShieldAlert;

  return (
    <article
      className={cn(
        "rounded-md border bg-black/35 p-3 text-sm",
        log.kind === "roll" && "border-arcane/40",
        log.kind === "damage" && "border-enemy/45",
        log.kind === "healing" && "border-ally/40",
        log.kind === "error" && "border-enemy/60 bg-enemy/10",
        log.kind === "system" && "border-antique/25",
        log.kind === "message" && "border-white/10",
        log.kind === "command" && "border-ruby-bright/35",
      )}
    >
      <div className="mb-2 flex items-start gap-2">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-antique">
          <Icon size={15} />
        </span>
        <div className="min-w-0">
          {log.user ? <p className="text-xs font-semibold text-antique">Usuário: {log.user}</p> : null}
          {log.command ? <p className="break-words text-xs text-stone-500">Comando: {log.command}</p> : null}
          <p className="mt-1 break-words font-semibold text-stone-100">{log.message}</p>
        </div>
      </div>
      {log.lines?.length ? (
        <div className="rounded-md border border-white/10 bg-black/35 p-3 text-stone-200">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Resultado</p>
          <div className="space-y-1">
            {log.lines.map((line) => (
              <p key={line} className="break-words text-sm leading-5">{line}</p>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
