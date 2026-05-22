import type { CharacterSpellcasting, PactMagicSlots, Spell, SpellSlot, SpellcastingClass, SpellcastingProgression } from "@/types/spells";

export const spellcastingProgressions: Record<SpellcastingClass, SpellcastingProgression> = {
  cleric: progression("cleric", "full_caster", "wisdom", "prepared"),
  sorcerer: progression("sorcerer", "full_caster", "charisma", "known"),
  warlock: {
    ...progression("warlock", "pact_magic", "charisma", "known"),
    // TODO: substituir por tabela completa do Livro do Jogador quando houver fonte local confiável.
    pactSlotTable: {
      1: { current: 1, max: 1, slotLevel: 1 },
      5: { current: 2, max: 2, slotLevel: 3 },
      7: { current: 2, max: 2, slotLevel: 4 },
    },
  },
  wizard: progression("wizard", "full_caster", "intelligence", "spellbook"),
  ranger: progression("ranger", "half_caster", "wisdom", "known"),
  bard: progression("bard", "full_caster", "charisma", "known"),
  druid: progression("druid", "full_caster", "wisdom", "prepared"),
  paladin: progression("paladin", "half_caster", "charisma", "prepared"),
};

export const mockSpells: Spell[] = [
  spell("sacred-flame", "Chama Sagrada", 0, "Evocação", "1 ação", "action", "18m", "Instantânea", "Radiação", ["cleric"], {
    saveAbility: "dexterity",
    damageFormula: "1d8",
    description: "Chama radiante desce sobre uma criatura. O alvo faz resistência de Destreza.",
  }),
  spell("cure-wounds", "Curar Ferimentos", 1, "Evocação", "1 ação", "action", "Toque", "Instantânea", undefined, ["cleric", "bard", "druid", "paladin", "ranger"], {
    healingFormula: "1d8+3",
    higherLevelDescription: "A cura aumenta em 1d8 para cada nível de slot acima do 1º.",
    description: "Uma criatura tocada recupera pontos de vida.",
  }),
  spell("arcane-shield", "Escudo Arcano", 1, "Abjuração", "1 reação", "reaction", "Pessoal", "1 rodada", undefined, ["wizard", "sorcerer"], {
    description: "Uma barreira arcana protege o conjurador até o início do próximo turno.",
  }),
  spell("witch-bolt", "Raio de Bruxa", 1, "Evocação", "1 ação", "action", "9m", "Concentração, 1 minuto", "Elétrico", ["warlock", "wizard", "sorcerer"], {
    requiresAttackRoll: true,
    concentration: true,
    damageFormula: "1d12",
    higherLevelDescription: "O dano inicial aumenta em 1d12 para cada nível de slot acima do 1º.",
    description: "Um raio crepitante conecta você ao alvo em um ataque mágico à distância.",
  }),
  spell("fireball", "Bola de Fogo", 3, "Evocação", "1 ação", "action", "45m", "Instantânea", "Fogo", ["wizard", "sorcerer"], {
    saveAbility: "dexterity",
    damageFormula: "8d6",
    description: "Uma explosão flamejante atinge uma área. Alvos fazem resistência de Destreza.",
  }),
];

export const characterSpellcasting: Record<string, CharacterSpellcasting> = {
  lilith: makeSpellcasting("warlock", 7, ["witch-bolt"]),
  lee: makeSpellcasting("wizard", 6, ["arcane-shield", "fireball"]),
  jack: makeSpellcasting("sorcerer", 6, ["arcane-shield", "fireball"]),
  raissa: makeSpellcasting("cleric", 7, ["sacred-flame", "cure-wounds"]),
  nero: makeSpellcasting("ranger", 7, ["cure-wounds"]),
  zak: makeSpellcasting("paladin", 5, ["cure-wounds"]),
};

function spell(
  id: string,
  name: string,
  level: Spell["level"],
  school: string,
  castingTime: string,
  actionType: Spell["actionType"],
  range: string,
  duration: string,
  damageType: string | undefined,
  sourceClasses: SpellcastingClass[],
  overrides: Partial<Spell>,
): Spell {
  return {
    id,
    name,
    level,
    school,
    castingTime,
    actionType,
    range,
    duration,
    concentration: false,
    ritual: false,
    description: "",
    damageType,
    sourceClasses,
    isKnown: true,
    isPrepared: true,
    ...overrides,
  };
}

function progression(className: SpellcastingClass, progressionType: SpellcastingProgression["progressionType"], spellcastingAbility: SpellcastingProgression["spellcastingAbility"], preparedMode: SpellcastingProgression["preparedMode"]): SpellcastingProgression {
  return {
    className,
    progressionType,
    spellcastingAbility,
    preparedMode,
    cantripsKnownByLevel: { 1: 2, 5: 3, 10: 4 },
    spellsKnownByLevel: preparedMode === "known" ? { 1: 2, 5: 6, 7: 8 } : undefined,
    // TODO: substituir por tabelas completas por classe quando houver fonte local confiável.
    slotTableByClassLevel: {
      1: { 1: 2 },
      5: progressionType === "half_caster" ? { 1: 4, 2: 2 } : { 1: 4, 2: 3, 3: 2 },
      6: progressionType === "half_caster" ? { 1: 4, 2: 2 } : { 1: 4, 2: 3, 3: 3 },
      7: progressionType === "half_caster" ? { 1: 4, 2: 3 } : { 1: 4, 2: 3, 3: 3, 4: 1 },
    },
  };
}

function makeSpellcasting(className: SpellcastingClass, level: number, spellIds: string[]): CharacterSpellcasting {
  const progressionData = spellcastingProgressions[className];
  const slots = makeSlots(progressionData.slotTableByClassLevel[level] ?? {});
  const pactSlots = progressionData.pactSlotTable?.[level];
  const spellcastingAbility = progressionData.spellcastingAbility;
  const abilityMod = level >= 7 ? 4 : 3;
  const proficiency = level >= 5 ? 3 : 2;

  return {
    className,
    progressionType: progressionData.progressionType,
    spellcastingAbility,
    spellSaveDc: 8 + proficiency + abilityMod,
    spellAttackBonus: proficiency + abilityMod,
    slots,
    pactSlots,
    spells: mockSpells.filter((spellItem) => spellIds.includes(spellItem.id) || spellItem.level === 0 && spellItem.sourceClasses.includes(className)),
  };
}

function makeSlots(table: Partial<Record<SpellSlot["level"], number>>): SpellSlot[] {
  return ([1, 2, 3, 4, 5, 6, 7, 8, 9] as SpellSlot["level"][]).map((level) => ({
    level,
    current: table[level] ?? 0,
    max: table[level] ?? 0,
  }));
}
