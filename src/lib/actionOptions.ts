import { lasferaSheets } from "@/data/lasfera";
import type { TableActionInput } from "@/types/actions";
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
      description: "Ataque simples com dano padrão do ator.",
    },
    {
      id: "quick-heal",
      name: "Cura rápida",
      type: "cura",
      healingExpression: "1d8+2",
      description: "Cura local mockada para suporte rápido.",
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
    description: ability.description,
  };
}
