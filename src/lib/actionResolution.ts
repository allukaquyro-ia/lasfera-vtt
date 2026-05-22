import { rollDiceExpression } from "@/lib/dice";
import { calculateModifier } from "@/lib/rules";
import type { ActionResolution, TableActionInput } from "@/types/actions";
import type { SessionActor } from "@/types/session";

export function clampHp(hp: number, maxHp: number) {
  return Math.max(0, Math.min(maxHp, Number.isFinite(hp) ? hp : 0));
}

export function resolveTableAction(input: TableActionInput, source: SessionActor, target: SessionActor): ActionResolution {
  if (source.conditions.includes("Atordoado")) {
    throw new Error(`${source.name} está Atordoado e não pode agir agora.`);
  }

  if (input.cost && source.resources[input.cost.resource] < input.cost.amount) {
    throw new Error(`${source.name} não tem ${input.cost.resource} suficiente. Necessário: ${input.cost.amount}.`);
  }

  const attackRoll = input.attackExpression ? rollDiceExpression(input.attackExpression) : undefined;
  const attack = attackRoll
    ? {
        roll: attackRoll,
        targetArmor: target.armor,
        didHit: attackRoll.isCritical || (!attackRoll.isFumble && attackRoll.total >= target.armor),
        isCritical: attackRoll.isCritical,
        isFumble: attackRoll.isFumble,
      }
    : undefined;

  const saveRoll = input.saveAttribute
    ? rollDiceExpression(`1d20${formatSigned(calculateModifier(target.attributeScores[input.saveAttribute]))}`)
    : undefined;
  const save = saveRoll && input.saveAttribute && input.saveDc
    ? {
        attribute: input.saveAttribute,
        dc: input.saveDc,
        roll: saveRoll,
        didResist: saveRoll.total >= input.saveDc,
      }
    : undefined;

  const attackAllowsEffect = !attack || attack.didHit;
  const saveAllowsFullEffect = !save || !save.didResist;
  const shouldRollEffect = attackAllowsEffect && (input.damageExpression || input.healingExpression);
  const effectRoll = shouldRollEffect ? rollDiceExpression(input.damageExpression ?? input.healingExpression ?? "1d1") : undefined;
  const criticalBonusRoll = attack?.isCritical && input.damageExpression ? rollDiceExpression(input.damageExpression) : undefined;
  const rawDamage = input.damageExpression ? (effectRoll?.total ?? 0) + (criticalBonusRoll?.total ?? 0) : undefined;
  const damageAmount = rawDamage !== undefined
    ? save?.didResist && input.halfDamageOnSave
      ? Math.floor(rawDamage / 2)
      : saveAllowsFullEffect
        ? rawDamage
        : 0
    : undefined;
  const healingAmount = input.healingExpression && attackAllowsEffect ? effectRoll?.total ?? 0 : undefined;
  const hpBefore = target.hp;
  const hpAfter = clampHp(target.hp - (damageAmount ?? 0) + (healingAmount ?? 0), target.maxHp);
  const conditionApplied = Boolean(input.condition && attackAllowsEffect && saveAllowsFullEffect && !target.conditions.includes(input.condition));

  return {
    sourceActorId: source.id,
    targetActorId: target.id,
    actionName: input.name,
    type: input.type,
    attack,
    save,
    damage: damageAmount !== undefined ? { roll: effectRoll, criticalBonusRoll, amount: damageAmount, hpBefore, hpAfter } : undefined,
    healing: healingAmount !== undefined ? { roll: effectRoll, amount: healingAmount, hpBefore, hpAfter } : undefined,
    condition: input.condition,
    conditionApplied,
    cost: input.cost,
    costPaid: Boolean(input.cost),
    success: attackAllowsEffect && saveAllowsFullEffect,
    timestamp: "agora",
  };
}

function formatSigned(value: number) {
  return value >= 0 ? `+${value}` : String(value);
}
