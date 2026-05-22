import { rollD20, rollDiceExpression } from "@/lib/dice";
import type {
  AttributeDefinition,
  AttributeKey,
  AttributeModifiers,
  AttributeScores,
  DiceRollResult,
  SavingThrowProficiencies,
  SkillDefinition,
  SkillKey,
  SkillProficiencies,
} from "@/types/rules";

export const attributes: AttributeDefinition[] = [
  { key: "strength", label: "Força", shortLabel: "FOR" },
  { key: "dexterity", label: "Destreza", shortLabel: "DES" },
  { key: "constitution", label: "Constituição", shortLabel: "CON" },
  { key: "intelligence", label: "Inteligência", shortLabel: "INT" },
  { key: "wisdom", label: "Sabedoria", shortLabel: "SAB" },
  { key: "charisma", label: "Carisma", shortLabel: "CAR" },
];

export const skills: SkillDefinition[] = [
  { key: "athletics", label: "Atletismo", attribute: "strength" },
  { key: "acrobatics", label: "Acrobacia", attribute: "dexterity" },
  { key: "stealth", label: "Furtividade", attribute: "dexterity" },
  { key: "arcana", label: "Arcanismo", attribute: "intelligence" },
  { key: "history", label: "História", attribute: "intelligence" },
  { key: "perception", label: "Percepção", attribute: "wisdom" },
  { key: "survival", label: "Sobrevivência", attribute: "wisdom" },
  { key: "insight", label: "Intuição", attribute: "wisdom" },
  { key: "persuasion", label: "Persuasão", attribute: "charisma" },
  { key: "intimidation", label: "Intimidação", attribute: "charisma" },
];

export const defaultAttributeScores: AttributeScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

export function calculateModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

export function calculateModifiers(scores: AttributeScores): AttributeModifiers {
  return {
    strength: calculateModifier(scores.strength),
    dexterity: calculateModifier(scores.dexterity),
    constitution: calculateModifier(scores.constitution),
    intelligence: calculateModifier(scores.intelligence),
    wisdom: calculateModifier(scores.wisdom),
    charisma: calculateModifier(scores.charisma),
  };
}

export function calculateProficiencyBonus(level: number) {
  return Math.max(2, Math.ceil(level / 4) + 1);
}

export function getSkillDefinition(skill: SkillKey) {
  return skills.find((item) => item.key === skill) ?? skills[0];
}

export function getAttributeDefinition(attribute: AttributeKey) {
  return attributes.find((item) => item.key === attribute) ?? attributes[0];
}

export function rollAttributeCheck(scores: AttributeScores, attribute: AttributeKey): DiceRollResult {
  return rollD20(calculateModifier(scores[attribute]));
}

export function rollSkillCheck(
  scores: AttributeScores,
  proficiencyBonus: number,
  proficiencies: SkillProficiencies,
  skill: SkillKey,
): DiceRollResult {
  const definition = getSkillDefinition(skill);
  const modifier = calculateModifier(scores[definition.attribute]) + (proficiencies[skill] ? proficiencyBonus : 0);
  return rollD20(modifier);
}

export function rollSavingThrow(
  scores: AttributeScores,
  proficiencyBonus: number,
  proficiencies: SavingThrowProficiencies,
  attribute: AttributeKey,
): DiceRollResult {
  const modifier = calculateModifier(scores[attribute]) + (proficiencies[attribute] ? proficiencyBonus : 0);
  return rollD20(modifier);
}

export function rollBasicAttack(scores: AttributeScores, proficiencyBonus: number) {
  return rollD20(calculateModifier(scores.strength) + proficiencyBonus);
}

export function rollDamage(expression = "1d8") {
  return rollDiceExpression(expression);
}
