"use client";

import { SessionProvider } from "@/state/SessionContext";
import { UiProvider } from "@/state/UiContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UiProvider>{children}</UiProvider>
    </SessionProvider>
  );
}
