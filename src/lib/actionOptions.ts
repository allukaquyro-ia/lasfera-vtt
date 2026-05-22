import { lasferaSheets } from "@/data/lasfera";
import type { ResourceCost, TableActionInput } from "@/types/actions";
import type { LasferaAbility } from "@/types/lasfera";
import type { SessionActor } from "@/types/session";

export type ActionOption = {
  id: string;
  name: string;
  type: TableActionInput["type"];
  attackExpression?: string;
  damageExpression?: string;
  healingExpression?: string;
  condition?: string;
  saveAttribute?: TableActionInput["saveAttribute"];
  saveDc?: number;
  halfDamageOnSave?: boolean;
  cost?: ResourceCost;
  description: string;
};

export function getActionOptions(actor: SessionActor): ActionOption[] {
  const sheet = lasferaSheets[actor.id];
  const abilityOptions = sheet?.abilities.map((ability) => mapAbility(actor, ability)) ?? [];

  return [
    {
      id: "basic-attack",
      name: "Ataque básico",
      type: "ataque",
      attackExpression: `1d20+${actor.proficiencyBonus}`,
      damageExpression: actor.damageExpression,
      cost: { resource: "foco", amount: 1 },
      description: "Ataque simples com dano padrão do ator.",
    },
    {
      id: "quick-heal",
      name: "Cura rápida",
      type: "cura",
      healingExpression: "1d8+2",
      cost: { resource: "mana", amount: 1 },
      description: "Cura local mockada para suporte rápido.",
    },
    {
      id: "tide-save",
      name: "Pressão das Marés",
      type: "magia",
      damageExpression: "2d6+2",
      condition: "Caído",
      saveAttribute: "constitution",
      saveDc: 15,
      halfDamageOnSave: true,
      cost: { resource: "mana", amount: 2 },
      description: "Efeito com resistência: falha causa dano e Caído; sucesso recebe metade do dano.",
    },
    {
      id: "healing-potion",
      name: "Poção de Cura",
      type: "item",
      healingExpression: "1d8+2",
      cost: { resource: "cargas", amount: 1 },
      description: "Consome uma carga mockada de item para curar o alvo.",
    },
    ...abilityOptions,
  ];
}

function mapAbility(actor: SessionActor, ability: LasferaAbility): ActionOption {
  return {
    id: ability.id,
    name: ability.name,
    type: ability.type === "magia" ? "magia" : ability.type === "bênção" ? "bênção" : ability.type === "item" ? "item" : "habilidade",
    attackExpression: ability.damage ? `1d20+${actor.proficiencyBonus}` : undefined,
    damageExpression: ability.damage,
    healingExpression: ability.healing,
    cost: ability.type === "bênção" ? { resource: "favor", amount: 1 } : ability.type === "item" ? { resource: "cargas", amount: 1 } : { resource: "mana", amount: ability.damage || ability.healing ? 2 : 1 },
    description: ability.description,
  };
}
