"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import { defaultCreatureRules, initialSessionState } from "@/data/session";
import { formatRollResult, rollDiceExpression } from "@/lib/dice";
import {
  calculateModifier,
  calculateProficiencyBonus,
  getAttributeDefinition,
  getSkillDefinition,
  rollAttributeCheck,
  rollBasicAttack,
  rollDamage,
  rollSavingThrow,
  rollSkillCheck,
} from "@/lib/rules";
import type { CreatureInput, SessionActor, SessionState } from "@/types/session";
import type { AttributeKey, SkillKey } from "@/types/rules";

type SessionAction =
  | { type: "select-token"; tokenId: string }
  | { type: "set-hp"; actorId: string; hp: number }
  | { type: "adjust-hp"; actorId: string; delta: number }
  | { type: "toggle-online"; actorId: string }
  | { type: "toggle-condition"; actorId: string; condition: string }
  | { type: "apply-damage"; actorId: string; amount: number }
  | { type: "apply-healing"; actorId: string; amount: number }
  | { type: "roll-expression"; actorId?: string; expression: string; label?: string }
  | { type: "roll-attribute"; actorId: string; attribute: AttributeKey }
  | { type: "roll-skill"; actorId: string; skill: SkillKey }
  | { type: "roll-save"; actorId: string; attribute: AttributeKey }
  | { type: "roll-basic-attack"; actorId: string }
  | { type: "roll-damage"; actorId: string }
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
  return calculateModifier(actor.attributeScores.dexterity);
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
    case "apply-damage": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const amount = Number.isFinite(action.amount) ? Math.max(0, Math.floor(action.amount)) : 0;
      const nextHp = clampHp(actor.hp - amount, actor.maxHp);
      return addLog(
        {
          ...state,
          actors: state.actors.map((item) => (item.id === action.actorId ? { ...item, hp: nextHp } : item)),
        },
        `${actor.name} sofreu ${amount} de dano. HP: ${nextHp}/${actor.maxHp}.`,
      );
    }
    case "apply-healing": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const amount = Number.isFinite(action.amount) ? Math.max(0, Math.floor(action.amount)) : 0;
      const nextHp = clampHp(actor.hp + amount, actor.maxHp);
      return addLog(
        {
          ...state,
          actors: state.actors.map((item) => (item.id === action.actorId ? { ...item, hp: nextHp } : item)),
        },
        `${actor.name} recuperou ${amount} de HP. HP: ${nextHp}/${actor.maxHp}.`,
      );
    }
    case "roll-expression": {
      try {
        const actor = action.actorId ? state.actors.find((item) => item.id === action.actorId) : null;
        const result = rollDiceExpression(action.expression);
        return addLog(state, formatRollResult(actor?.name ?? "Mesa", action.label ?? "rolagem", result));
      } catch (error) {
        return addLog(state, `Comando inválido: ${error instanceof Error ? error.message : "não foi possível rolar os dados."}`);
      }
    }
    case "roll-attribute": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const result = rollAttributeCheck(actor.attributeScores, action.attribute);
      return addLog(state, formatRollResult(actor.name, `atributo ${getAttributeDefinition(action.attribute).label}`, result));
    }
    case "roll-skill": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const skill = getSkillDefinition(action.skill);
      const result = rollSkillCheck(actor.attributeScores, actor.proficiencyBonus, actor.skillProficiencies, action.skill);
      return addLog(state, formatRollResult(actor.name, `perícia ${skill.label}`, result));
    }
    case "roll-save": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const result = rollSavingThrow(actor.attributeScores, actor.proficiencyBonus, actor.savingThrowProficiencies, action.attribute);
      return addLog(state, formatRollResult(actor.name, `resistência ${getAttributeDefinition(action.attribute).label}`, result));
    }
    case "roll-basic-attack": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const result = rollBasicAttack(actor.attributeScores, actor.proficiencyBonus);
      return addLog(state, formatRollResult(actor.name, "ataque básico", result));
    }
    case "roll-damage": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const result = rollDamage(actor.damageExpression);
      return addLog(state, formatRollResult(actor.name, "dano", result));
    }
    case "create-creature": {
      const id = nowId("creature");
      const creatureLevel = Math.max(1, action.creature.level);
      const creature: SessionActor = {
        id,
        kind: "creature",
        name: action.creature.name.trim() || "Criatura sem nome",
        className: action.creature.side === "enemy" ? "Inimigo invocado" : "Aliado invocado",
        level: creatureLevel,
        hp: action.creature.hp,
        maxHp: action.creature.hp,
        armor: action.creature.armor,
        side: action.creature.side,
        status: "Pronto",
        online: true,
        conditions: [],
        showHp: action.creature.showHp,
        showArmor: action.creature.showArmor,
        ...defaultCreatureRules,
        attributeScores: {
          strength: 12 + Math.min(6, creatureLevel),
          dexterity: 10 + Math.min(5, creatureLevel),
          constitution: 12 + Math.min(6, creatureLevel),
          intelligence: 10,
          wisdom: 10,
          charisma: 8,
        },
        proficiencyBonus: calculateProficiencyBonus(creatureLevel),
        damageExpression: creatureLevel > 4 ? "2d6+3" : "1d6+2",
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
          const result = rollDiceExpression(`1d20${modifier >= 0 ? `+${modifier}` : modifier}`);
          return { actorId: actor.id, name: actor.name, total: result.total, roll: result.rolls[0], modifier, dexterity: actor.attributeScores.dexterity };
        })
        .sort((a, b) => b.total - a.total || b.dexterity - a.dexterity);

      const initiativeLogs = order.map((entry) => `${entry.name} rolou iniciativa: 1d20 + ${entry.modifier} = ${entry.total}.`).join(" ");

      return addLog(
        {
          ...state,
          combat: { active: true, turnIndex: 0, order },
        },
        `${initiativeLogs} Turno atual: ${order[0]?.name ?? "nenhum participante"}.`,
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
