import type { DiceRollResult } from "@/types/rules";

export type TableActionType = "ataque" | "dano" | "cura" | "magia" | "habilidade" | "item" | "bênção" | "condição";

export type TableActionInput = {
  sourceActorId: string;
  targetActorId: string;
  type: TableActionType;
  name: string;
  attackExpression?: string;
  damageExpression?: string;
  healingExpression?: string;
  condition?: string;
};

export type TableActionEvent = TableActionInput & {
  id: string;
  attackRoll?: DiceRollResult;
  effectRoll?: DiceRollResult;
  appliedDamage?: number;
  appliedHealing?: number;
  timestamp: string;
  logText: string;
};
