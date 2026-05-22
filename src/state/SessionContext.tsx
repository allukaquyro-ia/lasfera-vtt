"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import { initialSessionState } from "@/data/session";
import type { CreatureInput, SessionActor, SessionState } from "@/types/session";

type SessionAction =
  | { type: "select-token"; tokenId: string }
  | { type: "set-hp"; actorId: string; hp: number }
  | { type: "adjust-hp"; actorId: string; delta: number }
  | { type: "toggle-online"; actorId: string }
  | { type: "toggle-condition"; actorId: string; condition: string }
  | { type: "create-creature"; creature: CreatureInput }
  | { type: "start-combat" }
  | { type: "next-turn" }
  | { type: "previous-turn" }
  | { type: "end-combat" }
  | { type: "add-log"; message: string };

type SessionContextValue = {
  state: SessionState;
  actorsById: Map<string, SessionActor>;
  selectedTokenActor: SessionActor | null;
  dispatch: React.Dispatch<SessionAction>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function nowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addLog(state: SessionState, message: string): SessionState {
  return {
    ...state,
    logs: [{ id: nowId("log"), message, createdAt: "agora" }, ...state.logs].slice(0, 80),
  };
}

function clampHp(hp: number, maxHp: number) {
  return Math.max(0, Math.min(maxHp, Number.isFinite(hp) ? hp : 0));
}

function initiativeModifier(actor: SessionActor) {
  if (actor.attributes?.Agilidade) {
    return actor.attributes.Agilidade;
  }

  return Math.max(0, Math.floor(actor.level / 2));
}

function reducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "select-token":
      return { ...state, selectedTokenId: action.tokenId };
    case "set-hp": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const nextHp = clampHp(action.hp, actor.maxHp);
      return addLog(
        {
          ...state,
          actors: state.actors.map((item) => (item.id === action.actorId ? { ...item, hp: nextHp } : item)),
        },
        `${actor.name} teve HP ajustado para ${nextHp}/${actor.maxHp}.`,
      );
    }
    case "adjust-hp": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const nextHp = clampHp(actor.hp + action.delta, actor.maxHp);
      return addLog(
        {
          ...state,
          actors: state.actors.map((item) => (item.id === action.actorId ? { ...item, hp: nextHp } : item)),
        },
        `${actor.name} teve HP alterado para ${nextHp}/${actor.maxHp}.`,
      );
    }
    case "toggle-online": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      return addLog(
        {
          ...state,
          actors: state.actors.map((item) => (item.id === action.actorId ? { ...item, online: !item.online } : item)),
        },
        `${actor.name} ficou ${actor.online ? "offline" : "online"}.`,
      );
    }
    case "toggle-condition": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const hasCondition = actor.conditions.includes(action.condition);
      const nextConditions = hasCondition
        ? actor.conditions.filter((condition) => condition !== action.condition)
        : [...actor.conditions, action.condition];
      return addLog(
        {
          ...state,
          actors: state.actors.map((item) => (item.id === action.actorId ? { ...item, conditions: nextConditions, status: nextConditions[0] ?? "Pronto" } : item)),
        },
        `${action.condition} ${hasCondition ? "removida de" : "aplicada em"} ${actor.name}.`,
      );
    }
    case "create-creature": {
      const id = nowId("creature");
      const creature: SessionActor = {
        id,
        kind: "creature",
        name: action.creature.name.trim() || "Criatura sem nome",
        className: action.creature.side === "enemy" ? "Inimigo invocado" : "Aliado invocado",
        level: action.creature.level,
        hp: action.creature.hp,
        maxHp: action.creature.hp,
        armor: action.creature.armor,
        side: action.creature.side,
        status: "Pronto",
        online: true,
        conditions: [],
        showHp: action.creature.showHp,
        showArmor: action.creature.showArmor,
      };
      const token = {
        id: `token-${id}`,
        actorId: id,
        name: creature.name,
        side: creature.side,
        x: 38 + (state.tokens.length % 5) * 7,
        y: 42 + (state.tokens.length % 3) * 10,
      };
      return addLog(
        {
          ...state,
          actors: [...state.actors, creature],
          tokens: [...state.tokens, token],
          selectedTokenId: token.id,
        },
        `${creature.name} criada e spawnada como ${creature.side === "enemy" ? "inimigo" : "aliado"}.`,
      );
    }
    case "start-combat": {
      const activeActorIds = new Set(state.tokens.map((token) => token.actorId));
      const order = state.actors
        .filter((actor) => activeActorIds.has(actor.id))
        .map((actor) => {
          const modifier = initiativeModifier(actor);
          const roll = Math.floor(Math.random() * 20) + 1;
          return { actorId: actor.id, name: actor.name, total: roll + modifier, roll, modifier };
        })
        .sort((a, b) => b.total - a.total);

      return addLog(
        {
          ...state,
          combat: { active: true, turnIndex: 0, order },
        },
        `Combate iniciado. Primeiro turno: ${order[0]?.name ?? "nenhum participante"}.`,
      );
    }
    case "next-turn": {
      if (!state.combat.active || state.combat.order.length === 0) return state;
      const turnIndex = (state.combat.turnIndex + 1) % state.combat.order.length;
      return addLog({ ...state, combat: { ...state.combat, turnIndex } }, `Turno avancou para ${state.combat.order[turnIndex].name}.`);
    }
    case "previous-turn": {
      if (!state.combat.active || state.combat.order.length === 0) return state;
      const turnIndex = (state.combat.turnIndex - 1 + state.combat.order.length) % state.combat.order.length;
      return addLog({ ...state, combat: { ...state.combat, turnIndex } }, `Turno voltou para ${state.combat.order[turnIndex].name}.`);
    }
    case "end-combat":
      return addLog({ ...state, combat: { active: false, turnIndex: 0, order: [] } }, "Combate encerrado.");
    case "add-log":
      return addLog(state, action.message);
    default:
      return state;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialSessionState);
  const actorsById = useMemo(() => new Map(state.actors.map((actor) => [actor.id, actor])), [state.actors]);
  const selectedToken = state.tokens.find((token) => token.id === state.selectedTokenId);
  const selectedTokenActor = selectedToken ? actorsById.get(selectedToken.actorId) ?? null : null;

  const value = useMemo(
    () => ({ state, actorsById, selectedTokenActor, dispatch }),
    [actorsById, selectedTokenActor, state],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return value;
}
