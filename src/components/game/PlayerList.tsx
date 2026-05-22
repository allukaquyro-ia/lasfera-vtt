"use client";

import Link from "next/link";
import { StatusChip } from "@/components/ui/StatusChip";
import { useSession } from "@/state/SessionContext";

export function PlayerList() {
  const { state } = useSession();
  const characters = state.actors.filter((actor) => actor.kind === "character");

  return (
    <div className="space-y-3">
      {characters.map((character) => (
        <Link
          href={`/personagem/${character.id}`}
          key={character.id}
          className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] p-3 transition hover:border-antique/40"
        >
          <div>
            <p className="font-semibold text-white">{character.name}</p>
            <p className="text-xs text-stone-400">{character.className}</p>
          </div>
          <StatusChip tone={character.online ? "ally" : "neutral"}>
            {character.online ? "online" : "off"}
          </StatusChip>
        </Link>
      ))}
    </div>
  );
}
