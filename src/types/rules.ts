export type AttributeKey = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

export type SkillKey =
  | "athletics"
  | "acrobatics"
  | "stealth"
  | "arcana"
  | "history"
  | "perception"
  | "survival"
  | "insight"
  | "persuasion"
  | "intimidation";

export type AttributeScores = Record<AttributeKey, number>;
export type AttributeModifiers = Record<AttributeKey, number>;
export type SkillProficiencies = Partial<Record<SkillKey, boolean>>;
export type SavingThrowProficiencies = Partial<Record<AttributeKey, boolean>>;

export type SkillDefinition = {
  key: SkillKey;
  label: string;
  attribute: AttributeKey;
};

export type AttributeDefinition = {
  key: AttributeKey;
  label: string;
  shortLabel: string;
};

export type DiceRollResult = {
  expression: string;
  rolls: number[];
  modifier: number;
  total: number;
  isCritical: boolean;
  isFumble: boolean;
};

export type ConditionTone = "ally" | "enemy" | "arcane" | "ruby" | "antique" | "neutral";

export type ConditionDefinition = {
  name: string;
  description: string;
  tone: ConditionTone;
  narrativeEffect: string;
};
