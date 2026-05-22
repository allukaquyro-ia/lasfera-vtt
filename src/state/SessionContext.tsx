"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import { defaultCreatureRules, initialSessionState } from "@/data/session";
import { rollDiceExpression } from "@/lib/dice";
import { clampHp, resolveTableAction } from "@/lib/actionResolution";
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
import type { Spell } from "@/types/spells";

type SessionAction =
  | { type: "select-token"; tokenId: string }
  | { type: "clear-selection" }
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
  | { type: "update-sheet-note"; actorId: string; value: string }
  | { type: "save-sheet-note"; actorId: string }
  | { type: "spend-spell-slot"; actorId: string; slotLevel: number }
  | { type: "recover-spell-slot"; actorId: string; slotLevel: number }
  | { type: "long-rest-spells"; actorId: string }
  | { type: "short-rest-pact"; actorId: string }
  | { type: "cast-spell"; actorId: string; targetActorId: string; spell: Spell; slotLevel?: number }
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
    case "clear-selection":
      return { ...state, selectedTokenId: null };
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
        const resolution = resolveTableAction(action.action, source, target);
        const nextHp = resolution.damage?.hpAfter ?? resolution.healing?.hpAfter ?? target.hp;
        const nextConditions = resolution.condition && resolution.conditionApplied ? [...target.conditions, resolution.condition] : target.conditions;
        const nextResources = resolution.cost
          ? {
              ...source.resources,
              [resolution.cost.resource]: Math.max(0, source.resources[resolution.cost.resource] - resolution.cost.amount),
            }
          : source.resources;

        const event: TableActionEvent = {
          ...action.action,
          id: nowId("action"),
          attackRoll: resolution.attack?.roll,
          effectRoll: resolution.damage?.roll ?? resolution.healing?.roll,
          appliedDamage: resolution.damage?.amount,
          appliedHealing: resolution.healing?.amount,
          resolution,
          timestamp: "agora",
          logText: `${source.name} usou ${action.action.name} em ${target.name}.`,
        };

        const lines = [
          ...(resolution.cost ? [`Custo: ${source.name} gastou ${resolution.cost.amount} de ${resolution.cost.resource}.`, `${resolution.cost.resource}: ${nextResources[resolution.cost.resource]}/${source.maxResources[resolution.cost.resource]}`] : []),
          ...actionRollLines("Ataque", resolution.attack?.roll),
          ...(resolution.attack ? [`CA do alvo: ${resolution.attack.targetArmor}`, `Resultado: ${resolution.attack.isCritical ? "Crítico" : resolution.attack.isFumble ? "Falha crítica" : resolution.attack.didHit ? "Acerto" : "Erro"}`] : []),
          ...(resolution.save ? [`Resistência: ${target.name} rolou ${resolution.save.attribute}.`, `${resolution.save.roll.expression} = ${resolution.save.roll.total}`, `CD: ${resolution.save.dc}`, `Resultado: ${resolution.save.didResist ? "Resistiu" : "Falhou"}`] : []),
          ...actionRollLines(resolution.healing ? "Cura" : "Dano", resolution.damage?.roll ?? resolution.healing?.roll),
          ...(resolution.damage?.criticalBonusRoll ? actionRollLines("Dano crítico adicional", resolution.damage.criticalBonusRoll) : []),
          ...(resolution.damage ? [`${target.name} sofreu ${resolution.damage.amount} de dano.`, `HP: ${resolution.damage.hpAfter}/${target.maxHp}`] : []),
          ...(resolution.healing ? [`${target.name} recuperou ${resolution.healing.amount} de HP.`, `HP: ${resolution.healing.hpAfter}/${target.maxHp}`] : []),
          ...(resolution.condition ? [`Condição: ${resolution.condition}${resolution.conditionApplied ? " aplicada" : " não aplicada"}.`] : []),
        ];

        return addLog(
          {
            ...state,
            actors: state.actors.map((actor) => {
              let nextActor = actor;
              if (actor.id === target.id) {
                nextActor = { ...nextActor, hp: nextHp, conditions: nextConditions, status: nextConditions[0] ?? actor.status };
              }
              if (actor.id === source.id) {
                nextActor = { ...nextActor, resources: nextResources };
              }
              return nextActor;
            }),
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
    case "update-sheet-note":
      return { ...state, sheetNotes: { ...state.sheetNotes, [action.actorId]: action.value } };
    case "save-sheet-note": {
      const actor = state.actors.find((item) => item.id === action.actorId);
      return addLog(state, {
        kind: "system",
        user: actor?.name,
        message: `${actor?.name ?? "Personagem"} atualizou anotações da ficha.`,
      });
    }
    case "spend-spell-slot":
      return {
        ...state,
        spellSlots: {
          ...state.spellSlots,
          [action.actorId]: (state.spellSlots[action.actorId] ?? []).map((slot) => (slot.level === action.slotLevel ? { ...slot, current: Math.max(0, slot.current - 1) } : slot)),
        },
      };
    case "recover-spell-slot":
      return {
        ...state,
        spellSlots: {
          ...state.spellSlots,
          [action.actorId]: (state.spellSlots[action.actorId] ?? []).map((slot) => (slot.level === action.slotLevel ? { ...slot, current: Math.min(slot.max, slot.current + 1) } : slot)),
        },
      };
    case "long-rest-spells":
      return addLog(
        {
          ...state,
          spellSlots: {
            ...state.spellSlots,
            [action.actorId]: (state.spellSlots[action.actorId] ?? []).map((slot) => ({ ...slot, current: slot.max })),
          },
        },
        { kind: "system", message: "Descanso longo: slots de magia recuperados." },
      );
    case "short-rest-pact": {
      const pact = state.pactSlots[action.actorId];
      return addLog(
        {
          ...state,
          pactSlots: pact ? { ...state.pactSlots, [action.actorId]: { ...pact, current: pact.max } } : state.pactSlots,
        },
        { kind: "system", message: "Descanso curto: slots de pacto recuperados." },
      );
    }
    case "cast-spell": {
      const source = state.actors.find((actor) => actor.id === action.actorId);
      const target = state.actors.find((actor) => actor.id === action.targetActorId);
      const spellcasting = state.spellcasting[action.actorId];
      if (!source || !target || !spellcasting) return state;

      const isCantrip = action.spell.level === 0;
      const chosenSlot = action.slotLevel;
      const pact = state.pactSlots[action.actorId];
      const usesPact = spellcasting.progressionType === "pact_magic" && !isCantrip;
      const normalSlot = chosenSlot ? state.spellSlots[action.actorId]?.find((slot) => slot.level === chosenSlot) : undefined;

      if (!isCantrip && usesPact && (!pact || pact.current <= 0 || pact.slotLevel < action.spell.level)) {
        return addLog(state, { kind: "error", user: source.name, message: `${source.name} não tem slot de pacto disponível para ${action.spell.name}.` });
      }

      if (!isCantrip && !usesPact && (!chosenSlot || !normalSlot || normalSlot.current <= 0 || chosenSlot < action.spell.level)) {
        return addLog(state, { kind: "error", user: source.name, message: `${source.name} não tem slot disponível para ${action.spell.name}.` });
      }

      const actionInput: TableActionInput = {
        sourceActorId: source.id,
        targetActorId: target.id,
        type: "magia",
        name: action.spell.name,
        attackExpression: action.spell.requiresAttackRoll ? `1d20+${spellcasting.spellAttackBonus}` : undefined,
        damageExpression: action.spell.damageFormula,
        healingExpression: action.spell.healingFormula,
        saveAttribute: action.spell.saveAbility,
        saveDc: action.spell.saveAbility ? spellcasting.spellSaveDc : undefined,
        halfDamageOnSave: Boolean(action.spell.damageFormula && action.spell.saveAbility),
      };

      try {
        const resolution = resolveTableAction(actionInput, source, target);
        const nextHp = resolution.damage?.hpAfter ?? resolution.healing?.hpAfter ?? target.hp;
        const nextSlots = isCantrip || usesPact
          ? state.spellSlots[action.actorId]
          : (state.spellSlots[action.actorId] ?? []).map((slot) => (slot.level === chosenSlot ? { ...slot, current: Math.max(0, slot.current - 1) } : slot));
        const nextPact = usesPact && pact ? { ...pact, current: Math.max(0, pact.current - 1) } : pact;
        const lines = [
          isCantrip ? "Truque: não consome slot." : usesPact ? `Magia de Pacto: slot nível ${pact?.slotLevel} gasto. Slots: ${(nextPact?.current ?? 0)}/${pact?.max ?? 0}` : `Slot gasto: nível ${chosenSlot}.`,
          ...actionRollLines("Ataque mágico", resolution.attack?.roll),
          ...(resolution.attack ? [`CA do alvo: ${resolution.attack.targetArmor}`, `Resultado: ${resolution.attack.didHit ? "Acerto" : "Erro"}`] : []),
          ...(resolution.save ? [`Resistência: ${target.name} rolou ${resolution.save.attribute}.`, `${resolution.save.roll.expression} = ${resolution.save.roll.total}`, `CD: ${resolution.save.dc}`, `Resultado: ${resolution.save.didResist ? "Resistiu" : "Falhou"}`] : []),
          ...actionRollLines(resolution.healing ? "Cura" : "Dano", resolution.damage?.roll ?? resolution.healing?.roll),
          ...(resolution.damage ? [`${target.name} sofreu ${resolution.damage.amount} de dano.`, `HP: ${resolution.damage.hpAfter}/${target.maxHp}`] : []),
          ...(resolution.healing ? [`${target.name} recuperou ${resolution.healing.amount} de HP.`, `HP: ${resolution.healing.hpAfter}/${target.maxHp}`] : []),
        ];

        return addLog(
          {
            ...state,
            actors: state.actors.map((actor) => (actor.id === target.id ? { ...actor, hp: nextHp } : actor)),
            spellSlots: { ...state.spellSlots, [action.actorId]: nextSlots },
            pactSlots: { ...state.pactSlots, [action.actorId]: nextPact },
          },
          { kind: "action", user: source.name, message: `${source.name} conjurou ${action.spell.name} em ${target.name}.`, lines },
        );
      } catch (error) {
        return addLog(state, { kind: "error", user: source.name, message: `Não foi possível conjurar ${action.spell.name}.`, lines: [error instanceof Error ? error.message : "Erro inesperado."] });
      }
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
