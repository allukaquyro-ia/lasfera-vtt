"use client";

import { StatusChip } from "@/components/ui/StatusChip";
import { useSession } from "@/state/SessionContext";
import { useUi } from "@/state/UiContext";

export function PlayerList() {
  const { state } = useSession();
  const { openCharacterSheet } = useUi();
  const characters = state.actors.filter((actor) => actor.kind === "character");

  return (
    <div className="space-y-3">
      {characters.map((character) => (
        <button
          key={character.id}
          className="block w-full rounded-md border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-antique/40"
          onClick={() => openCharacterSheet(character.id)}
          type="button"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{character.name}</p>
              <p className="truncate text-xs text-stone-400">{character.className}</p>
            </div>
            <StatusChip tone={character.online ? "ally" : "neutral"}>
              {character.online ? "online" : "off"}
            </StatusChip>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-300">
            <span>HP {character.hp}/{character.maxHp}</span>
            <span>CA {character.armor}</span>
          </div>
          <p className="mt-1 truncate text-xs text-antique/80">
            {character.conditions.length ? character.conditions.join(", ") : "sem condições"}
          </p>
        </button>
      ))}
    </div>
  );
}
