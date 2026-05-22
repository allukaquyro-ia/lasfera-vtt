"use client";

import { X } from "lucide-react";
import { CharacterSheet } from "@/components/game/CharacterSheet";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/state/SessionContext";
import { useUi } from "@/state/UiContext";

export function CharacterSheetDrawer() {
  const { openCharacterId, closeCharacterSheet } = useUi();
  const { actorsById } = useSession();
  const actor = openCharacterId ? actorsById.get(openCharacterId) : null;

  if (!openCharacterId) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 left-0 z-40 pointer-events-none right-0 xl:right-[420px]">
      <button className="absolute inset-0 bg-black/35 pointer-events-auto xl:hidden" aria-label="Fechar ficha" onClick={closeCharacterSheet} type="button" />
      <aside className="pointer-events-auto absolute inset-y-0 left-0 flex w-full max-w-[1180px] min-w-0 flex-col border-r border-antique/25 bg-void/95 shadow-ember backdrop-blur max-xl:max-w-[94vw]">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div>
            <p className="section-title">Ficha aberta</p>
            <h2 className="text-sm font-semibold text-white">{actor?.name ?? "Personagem"}</h2>
          </div>
          <Button className="h-9 w-9 px-0" type="button" variant="ghost" aria-label="Fechar ficha" onClick={closeCharacterSheet}>
            <X size={16} />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <CharacterSheet id={openCharacterId} compact />
        </div>
      </aside>
    </div>
  );
}
