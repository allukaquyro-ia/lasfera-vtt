import { characters } from "./characters";
import { logs } from "./campaign";
import { calculateProficiencyBonus, defaultAttributeScores } from "@/lib/rules";
import type { AttributeScores, SavingThrowProficiencies, SkillProficiencies } from "@/types/rules";
import type { LogEntry, SessionActor, SessionState, SessionToken } from "@/types/session";

function scoreFromLegacyModifier(value = 0) {
  return Math.max(6, Math.min(20, 10 + value * 2));
}

function buildScores(attributes: Record<string, number>): AttributeScores {
  return {
    strength: scoreFromLegacyModifier(attributes.Forca),
    dexterity: scoreFromLegacyModifier(attributes.Agilidade),
    constitution: scoreFromLegacyModifier(attributes.Vigor),
    intelligence: scoreFromLegacyModifier(attributes.Intelecto),
    wisdom: scoreFromLegacyModifier(attributes.Presenca),
    charisma: scoreFromLegacyModifier(attributes.Sombra),
  };
}

function buildSkillProficiencies(name: string): SkillProficiencies {
  const presets: Record<string, SkillProficiencies> = {
    Lilith: { arcana: true, intimidation: true, insight: true },
    Nero: { athletics: true, intimidation: true, survival: true },
    Lee: { acrobatics: true, stealth: true, arcana: true },
    Jack: { athletics: true, persuasion: true, intimidation: true },
    Raissa: { perception: true, insight: true, survival: true },
    Zak: { stealth: true, survival: true, perception: true },
  };

  return presets[name] ?? {};
}

function buildSavingThrows(name: string): SavingThrowProficiencies {
  const presets: Record<string, SavingThrowProficiencies> = {
    Lilith: { intelligence: true, charisma: true },
    Nero: { strength: true, constitution: true },
    Lee: { dexterity: true, intelligence: true },
    Jack: { strength: true, charisma: true },
    Raissa: { wisdom: true, charisma: true },
    Zak: { dexterity: true, wisdom: true },
  };

  return presets[name] ?? {};
}

export const initialActors: SessionActor[] = characters.map((character) => ({
  ...character,
  kind: "character",
  conditions: character.status === "Pronto" ? [] : [character.status],
  showHp: true,
  showArmor: true,
  attributeScores: buildScores(character.attributes),
  proficiencyBonus: calculateProficiencyBonus(character.level),
  skillProficiencies: buildSkillProficiencies(character.name),
  savingThrowProficiencies: buildSavingThrows(character.name),
  damageExpression: character.name === "Lilith" || character.name === "Raissa" ? "1d8+3" : "1d8+2",
}));

export const defaultCreatureRules = {
  attributeScores: defaultAttributeScores,
  proficiencyBonus: 2,
  skillProficiencies: {},
  savingThrowProficiencies: {},
  damageExpression: "1d6+2",
};

export const initialTokens: SessionToken[] = initialActors.map((actor, index) => ({
  id: `token-${actor.id}`,
  actorId: actor.id,
  name: actor.name,
  side: actor.side,
  x: 18 + index * 11,
  y: 28 + (index % 2) * 18,
}));

const initialLogs: LogEntry[] = logs.map((message, index) => ({
  id: `log-${index}`,
  kind: "system",
  message,
  createdAt: "agora",
}));

export const initialSessionState: SessionState = {
  actors: initialActors,
  tokens: initialTokens,
  logs: initialLogs,
  actionHistory: [],
  sheetNotes: {},
  selectedTokenId: initialTokens[0]?.id ?? null,
  combat: {
    active: false,
    turnIndex: 0,
    order: [],
  },
};
