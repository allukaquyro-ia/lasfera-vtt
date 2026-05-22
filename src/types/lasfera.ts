export type ElementTone = "water" | "fire" | "earth" | "wind" | "lightning" | "light" | "shadow" | "ice" | "magma";

export type LasferaElement = {
  name: string;
  tone: ElementTone;
  description: string;
  level?: number;
  unlockedAbilities: string[];
};

export type ElementalAbility = {
  id: string;
  name: string;
  element: string;
  cost: string;
  description: string;
  damage?: string;
  healing?: string;
};

export type Blessing = {
  id: string;
  name: string;
  deity: string;
  stage: number;
  progress: number;
  activeEffects: string[];
  permanentEffects: string[];
  description: string;
  history: string[];
};

export type InventoryItem = {
  id: string;
  name: string;
  type: "arma" | "armadura" | "consumível" | "mágico" | "mochila";
  rarity: "comum" | "incomum" | "raro" | "épico" | "lendário";
  description: string;
  quantity: number;
  equipped: boolean;
};

export type LasferaAbility = {
  id: string;
  name: string;
  type: "magia" | "elemental" | "bênção" | "técnica" | "item";
  cost: string;
  range: string;
  damage?: string;
  healing?: string;
  description: string;
};

export type LasferaCharacterSheet = {
  actorId: string;
  race: string;
  className: string;
  level: number;
  background: string;
  portrait: string;
  summary: string;
  primaryElement: string;
  elementalLevel: number;
  absorbedElements: LasferaElement[];
  mysticFusions: string[];
  elementalAbilities: ElementalAbility[];
  blessings: Blessing[];
  inventory: InventoryItem[];
  gold: number;
  magicStones: number;
  abilities: LasferaAbility[];
  notes: string;
};
