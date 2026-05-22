import type { DiceRollResult } from "@/types/rules";
import type { AttributeKey } from "@/types/rules";

export type TableActionType = "ataque" | "dano" | "cura" | "magia" | "habilidade" | "item" | "bênção" | "condição";

export type ResourceKey = "mana" | "foco" | "favor" | "cargas";

export type ResourceCost = {
  resource: ResourceKey;
  amount: number;
};

export type TableActionInput = {
  sourceActorId: string;
  targetActorId: string;
  type: TableActionType;
  name: string;
  attackExpression?: string;
  damageExpression?: string;
  healingExpression?: string;
  condition?: string;
  saveAttribute?: AttributeKey;
  saveDc?: number;
  halfDamageOnSave?: boolean;
  cost?: ResourceCost;
};

export type AttackResolution = {
  roll: DiceRollResult;
  targetArmor: number;
  didHit: boolean;
  isCritical: boolean;
  isFumble: boolean;
};

export type SaveResolution = {
  attribute: AttributeKey;
  dc: number;
  roll: DiceRollResult;
  didResist: boolean;
};

export type DamageResolution = {
  roll?: DiceRollResult;
  criticalBonusRoll?: DiceRollResult;
  amount: number;
  hpBefore: number;
  hpAfter: number;
};

export type HealingResolution = {
  roll?: DiceRollResult;
  amount: number;
  hpBefore: number;
  hpAfter: number;
};

export type ActionResolution = {
  sourceActorId: string;
  targetActorId: string;
  actionName: string;
  type: TableActionType;
  attack?: AttackResolution;
  save?: SaveResolution;
  damage?: DamageResolution;
  healing?: HealingResolution;
  condition?: string;
  conditionApplied?: boolean;
  cost?: ResourceCost;
  costPaid?: boolean;
  success: boolean;
  timestamp: string;
};

export type ActionPreview = {
  type: TableActionType;
  targetName: string;
  attackText?: string;
  saveText?: string;
  effectText?: string;
  costText?: string;
  conditionText?: string;
};

export type TableActionEvent = TableActionInput & {
  id: string;
  attackRoll?: DiceRollResult;
  effectRoll?: DiceRollResult;
  appliedDamage?: number;
  appliedHealing?: number;
  resolution?: ActionResolution;
  timestamp: string;
  logText: string;
};
