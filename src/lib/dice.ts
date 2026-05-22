import type { DiceRollResult } from "@/types/rules";

const dicePattern = /^(\d*)d(\d+)([+-]\d+)?$/i;

export function rollDie(sides: number) {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollD20(modifier = 0): DiceRollResult {
  return rollDiceExpression(`1d20${modifier >= 0 ? `+${modifier}` : modifier}`);
}

export function rollDiceExpression(expression: string): DiceRollResult {
  const normalized = expression.replace(/\s+/g, "").toLowerCase();
  const match = normalized.match(dicePattern);

  if (!match) {
    throw new Error("Use formatos como 1d20, 2d6, 1d8+3 ou 2d4+2.");
  }

  const amount = Number(match[1] || 1);
  const sides = Number(match[2]);
  const modifier = Number(match[3] || 0);

  if (amount < 1 || amount > 20 || sides < 2 || sides > 100) {
    throw new Error("A rolagem precisa ter entre 1 e 20 dados, com faces entre d2 e d100.");
  }

  const rolls = Array.from({ length: amount }, () => rollDie(sides));
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;

  return {
    expression: normalized,
    rolls,
    modifier,
    total,
    isCritical: amount === 1 && sides === 20 && rolls[0] === 20,
    isFumble: amount === 1 && sides === 20 && rolls[0] === 1,
  };
}

export function formatRollResult(actorName: string, type: string, result: DiceRollResult) {
  const flags = [result.isCritical ? "crítico" : "", result.isFumble ? "falha crítica" : ""].filter(Boolean);
  const modifier = result.modifier === 0 ? "" : ` ${result.modifier > 0 ? "+" : "-"} ${Math.abs(result.modifier)}`;
  return `${actorName} rolou ${type}: ${result.expression} [${result.rolls.join(", ")}]${modifier} = ${result.total}${flags.length ? ` (${flags.join(", ")})` : ""}.`;
}
