"use client";

import { SessionProvider } from "@/state/SessionContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
