"use client";

import { createContext, useContext, useMemo, useState } from "react";

type UiContextValue = {
  openCharacterId: string | null;
  openCharacterSheet: (id: string) => void;
  closeCharacterSheet: () => void;
};

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [openCharacterId, setOpenCharacterId] = useState<string | null>(null);
  const value = useMemo(
    () => ({
      openCharacterId,
      openCharacterSheet: setOpenCharacterId,
      closeCharacterSheet: () => setOpenCharacterId(null),
    }),
    [openCharacterId],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const value = useContext(UiContext);
  if (!value) {
    throw new Error("useUi must be used inside UiProvider");
  }
  return value;
}
