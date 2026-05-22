"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import { defaultCreatureRules, initialSessionState } from "@/data/session";
import { rollDiceExpression } from "@/lib/dice";
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
import type { TableActionEvent, TableActionInput } from "@/types/actions";
import type { CreatureInput, LogEntry, LogKind, SessionActor, SessionState } from "@/types/session";
import type { AttributeKey, DiceRollResult, SkillKey } from "@/types/rules";

type SessionAction =
  | { type: "select-token"; tokenId: string }
  | { type: "set-hp"; actorId: string; hp: number }
  | { type: "adjust-hp"; actorId: string; delta: number }
  | { type: "toggle-online"; actorId: string }
  | { type: "toggle-condition"; actorId: string; condition: string }
  | { type: "select-actor"; actorId: string }
  | { type: "apply-damage"; actorId: string; amount: number; user?: string; command?: string }
  | { type: "apply-healing"; actorId: string; amount: number; user?: string; command?: string }
  | { type: "roll-expression"; actorId?: string; expression: string; label?: string; user?: string; command?: string }
  | { type: "roll-attribute"; actorId: string; attribute: AttributeKey }
  | { type: "roll-skill"; actorId: string; skill: SkillKey }
  | { type: "roll-save"; actorId: string; attribute: AttributeKey }
  | { type: "roll-basic-attack"; actorId: string }
  | { type: "roll-damage"; actorId: string }
  | { type: "execute-table-action"; action: TableActionInput }
  | { type: "pass-turn"; actorId: string }
  | { type: "create-creature"; creature: CreatureInput }
  | { type: "start-combat" }
  | { type: "next-turn" }
  | { type: "previous-turn" }
  | { type: "end-combat" }
  | { type: "add-log"; message: string; kind?: LogKind; user?: string; command?: string; lines?: string[] };

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

type LogInput = string | Omit<LogEntry, "id" | "createdAt">;

function addLog(state: SessionState, input: LogInput): SessionState {
  const entry = typeof input === "string" ? { kind: "system" as const, message: input } : input;

  return {
    ...state,
    logs: [...state.logs, { ...entry, id: nowId("log"), createdAt: "agora" }].slice(-100),
  };
}

function formatModifier(modifier: number) {
  if (modifier === 0) return "+ 0";
  return `${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
}

function rollLog(actorName: string, type: string, result: DiceRollResult, command?: string, user?: string): Omit<LogEntry, "id" | "createdAt"> {
  const criticalLine = result.isCritical ? "Crítico natural 20." : result.isFumble ? "Falha crítica natural 1." : undefined;

  return {
    kind: "roll",
    user: user ?? actorName,
    command,
    message: `${actorName} rolou ${type}.`,
    lines: [
      result.expression,
      `Rolagem: ${result.rolls.join(" + ")} ${formatModifier(result.modifier)}`,
      `Total: ${result.total}`,
      ...(criticalLine ? [criticalLine] : []),
    ],
  };
}

function clampHp(hp: number, maxHp: number) {
  return Math.max(0, Math.min(maxHp, Number.isFinite(hp) ? hp : 0));
}

function initiativeModifier(actor: SessionActor) {
  return calculateModifier(actor.attributeScores.dexterity);
}

function actionRollLines(label: string, result?: DiceRollResult) {
  if (!result) return [];
  return [
    `${label}:`,
    result.expression,
    `Rolagem: ${result.rolls.join(" + ")} ${formatModifier(result.modifier)}`,
    `Total: ${result.total}`,
  ];
}

function advanceTurn(state: SessionState) {
  if (!state.combat.active || state.combat.order.length === 0) {
    return state.combat;
  }

  return {
    ...state.combat,
    turnIndex: (state.combat.turnIndex + 1) % state.combat.order.length,
  };
}

function reducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "select-token":
      return { ...state, selectedTokenId: action.tokenId };
    case "select-actor": {
      const token = state.tokens.find((item) => item.actorId === action.actorId);
      return token ? { ...state, selectedTokenId: token.id } : state;
    }
    case "set-hp": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const nextHp = clampHp(action.hp, actor.maxHp);
      return addLog(
        {
          ...state,
          actors: state.actors.map((item) => (item.id === action.actorId ? { ...item, hp: nextHp } : item)),
        },
        { kind: "system", message: `${actor.name} teve HP ajustado para ${nextHp}/${actor.maxHp}.` },
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
        { kind: "system", message: `${actor.name} teve HP alterado para ${nextHp}/${actor.maxHp}.` },
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
        { kind: "system", message: `${actor.name} ficou ${actor.online ? "offline" : "online"}.` },
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
        { kind: "system", message: `${action.condition} ${hasCondition ? "removida de" : "aplicada em"} ${actor.name}.` },
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
        {
          kind: "damage",
          user: action.user,
          command: action.command,
          message: `${actor.name} sofreu ${amount} de dano.`,
          lines: [`HP: ${nextHp}/${actor.maxHp}`],
        },
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
        {
          kind: "healing",
          user: action.user,
          command: action.command,
          message: `${actor.name} recuperou ${amount} de HP.`,
          lines: [`HP: ${nextHp}/${actor.maxHp}`],
        },
      );
    }
    case "roll-expression": {
      try {
        const actor = action.actorId ? state.actors.find((item) => item.id === action.actorId) : null;
        const result = rollDiceExpression(action.expression);
        return addLog(state, rollLog(actor?.name ?? "Mesa", action.label ?? "rolagem", result, action.command, action.user));
      } catch (error) {
        return addLog(state, {
          kind: "error",
          user: action.user,
          command: action.command,
          message: "Comando inválido.",
          lines: [error instanceof Error ? error.message : "Não foi possível rolar os dados."],
        });
      }
    }
    case "roll-attribute": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const result = rollAttributeCheck(actor.attributeScores, action.attribute);
      return addLog(state, rollLog(actor.name, `atributo ${getAttributeDefinition(action.attribute).label}`, result));
    }
    case "roll-skill": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const skill = getSkillDefinition(action.skill);
      const result = rollSkillCheck(actor.attributeScores, actor.proficiencyBonus, actor.skillProficiencies, action.skill);
      return addLog(state, rollLog(actor.name, `perícia ${skill.label}`, result));
    }
    case "roll-save": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const result = rollSavingThrow(actor.attributeScores, actor.proficiencyBonus, actor.savingThrowProficiencies, action.attribute);
      return addLog(state, rollLog(actor.name, `resistência ${getAttributeDefinition(action.attribute).label}`, result));
    }
    case "roll-basic-attack": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const result = rollBasicAttack(actor.attributeScores, actor.proficiencyBonus);
      return addLog(state, rollLog(actor.name, "ataque básico", result));
    }
    case "roll-damage": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!actor) return state;
      const result = rollDamage(actor.damageExpression);
      return addLog(state, rollLog(actor.name, "dano", result));
    }
    case "execute-table-action": {
      const source = state.actors.find((actor) => actor.id === action.action.sourceActorId);
      const target = state.actors.find((actor) => actor.id === action.action.targetActorId);
      if (!source || !target) return state;

      try {
        const attackRoll = action.action.attackExpression ? rollDiceExpression(action.action.attackExpression) : undefined;
        const effectExpression = action.action.damageExpression ?? action.action.healingExpression;
        const effectRoll = effectExpression ? rollDiceExpression(effectExpression) : undefined;
        const appliedDamage = action.action.damageExpression ? effectRoll?.total ?? 0 : undefined;
        const appliedHealing = action.action.healingExpression ? effectRoll?.total ?? 0 : undefined;
        const nextHp = clampHp(target.hp - (appliedDamage ?? 0) + (appliedHealing ?? 0), target.maxHp);
        const conditionApplied = action.action.condition && !target.conditions.includes(action.action.condition);
        const nextConditions = action.action.condition
          ? conditionApplied
            ? [...target.conditions, action.action.condition]
            : target.conditions
          : target.conditions;

        const event: TableActionEvent = {
          ...action.action,
          id: nowId("action"),
          attackRoll,
          effectRoll,
          appliedDamage,
          appliedHealing,
          timestamp: "agora",
          logText: `${source.name} usou ${action.action.name} em ${target.name}.`,
        };

        const lines = [
          ...actionRollLines("Ataque", attackRoll),
          ...actionRollLines(appliedHealing !== undefined ? "Cura" : "Dano", effectRoll),
          ...(appliedDamage !== undefined ? [`${target.name} sofreu ${appliedDamage} de dano.`, `HP: ${nextHp}/${target.maxHp}`] : []),
          ...(appliedHealing !== undefined ? [`${target.name} recuperou ${appliedHealing} de HP.`, `HP: ${nextHp}/${target.maxHp}`] : []),
          ...(action.action.condition ? [`Condição: ${action.action.condition}${conditionApplied ? " aplicada" : " já estava ativa"}.`] : []),
        ];

        return addLog(
          {
            ...state,
            actors: state.actors.map((actor) => (actor.id === target.id ? { ...actor, hp: nextHp, conditions: nextConditions, status: nextConditions[0] ?? actor.status } : actor)),
            actionHistory: [...state.actionHistory, event].slice(-100),
          },
          {
            kind: "action",
            user: source.name,
            message: event.logText,
            lines,
          },
        );
      } catch (error) {
        return addLog(state, {
          kind: "error",
          user: source.name,
          message: `Não foi possível usar ${action.action.name}.`,
          lines: [error instanceof Error ? error.message : "Erro inesperado na ação."],
        });
      }
    }
    case "pass-turn": {
      const current = state.combat.order[state.combat.turnIndex];
      const actor = state.actors.find((item) => item.id === action.actorId);
      if (!state.combat.active || !current || current.actorId !== action.actorId || !actor) {
        return addLog(state, {
          kind: "error",
          user: actor?.name,
          message: "Não é o turno deste personagem.",
        });
      }

      const combat = advanceTurn(state);
      const next = combat.order[combat.turnIndex];
      return addLog(
        { ...state, combat },
        {
          kind: "system",
          user: actor.name,
          message: `${actor.name} passou o turno.`,
          lines: next ? [`Turno atual: ${next.name}.`] : undefined,
        },
      );
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
        { kind: "system", message: `${creature.name} criada e spawnada como ${creature.side === "enemy" ? "inimigo" : "aliado"}.` },
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

      const initiativeLogs = order
        .map((entry) => `${entry.name} rolou iniciativa: 1d20 ${formatModifier(entry.modifier)} = ${entry.total}.`)
        .join(" ");

      return addLog(
        {
          ...state,
          combat: { active: true, turnIndex: 0, order },
        },
        {
          kind: "system",
          message: "Combate iniciado.",
          lines: [initiativeLogs, `Turno atual: ${order[0]?.name ?? "nenhum participante"}.`],
        },
      );
    }
    case "next-turn": {
      if (!state.combat.active || state.combat.order.length === 0) return state;
      const turnIndex = (state.combat.turnIndex + 1) % state.combat.order.length;
      return addLog({ ...state, combat: { ...state.combat, turnIndex } }, { kind: "system", message: `Turno avançou para ${state.combat.order[turnIndex].name}.` });
    }
    case "previous-turn": {
      if (!state.combat.active || state.combat.order.length === 0) return state;
      const turnIndex = (state.combat.turnIndex - 1 + state.combat.order.length) % state.combat.order.length;
      return addLog({ ...state, combat: { ...state.combat, turnIndex } }, { kind: "system", message: `Turno voltou para ${state.combat.order[turnIndex].name}.` });
    }
    case "end-combat":
      return addLog({ ...state, combat: { active: false, turnIndex: 0, order: [] } }, { kind: "system", message: "Combate encerrado." });
    case "add-log":
      return addLog(state, { kind: action.kind ?? "message", message: action.message, user: action.user, command: action.command, lines: action.lines });
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
