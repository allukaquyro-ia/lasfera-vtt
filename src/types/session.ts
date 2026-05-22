import type { CharacterSide } from "@/data/characters";
import type { ResourceKey, TableActionEvent } from "@/types/actions";
import type { AttributeScores, SavingThrowProficiencies, SkillProficiencies } from "@/types/rules";
import type { CharacterSpellcasting, PactMagicSlots, SpellSlot } from "@/types/spells";

export type ActorKind = "character" | "creature";
export type TokenSide = CharacterSide;

export type SessionActor = {
  id: string;
  kind: ActorKind;
  name: string;
  player?: string;
  className: string;
  level: number;
  hp: number;
  maxHp: number;
  armor: number;
  side: TokenSide;
  status: string;
  online: boolean;
  conditions: string[];
  showHp: boolean;
  showArmor: boolean;
  element?: string;
  attributes?: Record<string, number>;
  attributeScores: AttributeScores;
  proficiencyBonus: number;
  skillProficiencies: SkillProficiencies;
  savingThrowProficiencies: SavingThrowProficiencies;
  damageExpression: string;
  resources: Record<ResourceKey, number>;
  maxResources: Record<ResourceKey, number>;
  spells?: string[];
  inventory?: string[];
  blessings?: string[];
  notes?: string;
};

export type SessionToken = {
  id: string;
  actorId: string;
  name: string;
  side: TokenSide;
  x: number;
  y: number;
};

export type LogKind = "message" | "command" | "roll" | "damage" | "healing" | "action" | "system" | "error";

export type LogEntry = {
  id: string;
  kind: LogKind;
  user?: string;
  command?: string;
  message: string;
  lines?: string[];
  createdAt: string;
};

export type InitiativeEntry = {
  actorId: string;
  name: string;
  total: number;
  roll: number;
  modifier: number;
  dexterity: number;
};

export type CombatState = {
  active: boolean;
  turnIndex: number;
  order: InitiativeEntry[];
};

export type SessionState = {
  actors: SessionActor[];
  tokens: SessionToken[];
  logs: LogEntry[];
  actionHistory: TableActionEvent[];
  sheetNotes: Record<string, string>;
  spellcasting: Record<string, CharacterSpellcasting>;
  spellSlots: Record<string, SpellSlot[]>;
  pactSlots: Record<string, PactMagicSlots | undefined>;
  selectedTokenId: string | null;
  combat: CombatState;
};

export type CreatureInput = {
  name: string;
  level: number;
  hp: number;
  armor: number;
  side: "ally" | "enemy";
  showHp: boolean;
  showArmor: boolean;
};
