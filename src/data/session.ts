import { characters } from "./characters";
import { logs } from "./campaign";
import type { LogEntry, SessionActor, SessionState, SessionToken } from "@/types/session";

export const initialActors: SessionActor[] = characters.map((character) => ({
  ...character,
  kind: "character",
  conditions: character.status === "Pronto" ? [] : [character.status],
  showHp: true,
  showArmor: true,
}));

export const initialTokens: SessionToken[] = initialActors.map((actor, index) => ({
  id: `token-${actor.id}`,
  actorId: actor.id,
  name: actor.name,
  side: actor.side,
  x: 18 + index * 11,
  y: 28 + (index % 2) * 18,
}));

const initialLogs: LogEntry[] = logs.map((message, index) => ({
  id: `log-${index}`,
  message,
  createdAt: "agora",
}));

export const initialSessionState: SessionState = {
  actors: initialActors,
  tokens: initialTokens,
  logs: initialLogs,
  selectedTokenId: initialTokens[0]?.id ?? null,
  combat: {
    active: false,
    turnIndex: 0,
    order: [],
  },
};
