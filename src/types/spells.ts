import type { AttributeKey } from "@/types/rules";

export type SpellcastingClass = "cleric" | "sorcerer" | "warlock" | "wizard" | "ranger" | "bard" | "druid" | "paladin";
export type SpellcastingProgressionType = "full_caster" | "half_caster" | "pact_magic";
export type PreparedMode = "known" | "prepared" | "spellbook";
export type SpellActionType = "action" | "bonus_action" | "reaction" | "ritual" | "minute" | "hour";

export type Spell = {
  id: string;
  name: string;
  level: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  school: string;
  castingTime: string;
  actionType: SpellActionType;
  range: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevelDescription?: string;
  damageFormula?: string;
  healingFormula?: string;
  damageType?: string;
  saveAbility?: AttributeKey;
  requiresAttackRoll?: boolean;
  sourceClasses: SpellcastingClass[];
  isKnown: boolean;
  isPrepared: boolean;
};

export type SpellSlot = {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  current: number;
  max: number;
};

export type PactMagicSlots = {
  current: number;
  max: number;
  slotLevel: 1 | 2 | 3 | 4 | 5;
};

export type SpellcastingProgression = {
  className: SpellcastingClass;
  progressionType: SpellcastingProgressionType;
  spellcastingAbility: AttributeKey;
  cantripsKnownByLevel: Record<number, number>;
  spellsKnownByLevel?: Record<number, number>;
  preparedMode: PreparedMode;
  slotTableByClassLevel: Record<number, Partial<Record<SpellSlot["level"], number>>>;
  pactSlotTable?: Record<number, PactMagicSlots>;
};

// Slots elementais são homebrew de Lasfera e não substituem slots D&D.
export type ElementalSpellSlot = {
  element: string;
  level: number;
  current: number;
  max: number;
  source: string;
  description: string;
};

export type CharacterSpellcasting = {
  className: SpellcastingClass;
  progressionType: SpellcastingProgressionType;
  spellcastingAbility: AttributeKey;
  spellSaveDc: number;
  spellAttackBonus: number;
  slots: SpellSlot[];
  pactSlots?: PactMagicSlots;
  spells: Spell[];
};
