import type { ConditionDefinition } from "@/types/rules";

export const conditions: ConditionDefinition[] = [
  {
    name: "Atordoado",
    description: "A criatura reage com lentidão e perde clareza imediata.",
    tone: "arcane",
    narrativeEffect: "A cena ao redor parece distante e fragmentada.",
  },
  {
    name: "Enfeitiçado",
    description: "A vontade da criatura está influenciada por magia ou presença.",
    tone: "ruby",
    narrativeEffect: "Palavras externas soam mais verdadeiras do que deveriam.",
  },
  {
    name: "Envenenado",
    description: "Uma toxina física ou arcana prejudica o corpo.",
    tone: "ally",
    narrativeEffect: "Veias escurecem e o fôlego fica curto.",
  },
  {
    name: "Caído",
    description: "A criatura está no chão ou em posição vulnerável.",
    tone: "neutral",
    narrativeEffect: "Levantar exige espaço e atenção.",
  },
  {
    name: "Sangrando",
    description: "Ferimentos abertos continuam drenando vigor.",
    tone: "enemy",
    narrativeEffect: "Rastros vermelhos marcam cada movimento.",
  },
  {
    name: "Concentrando",
    description: "A criatura sustenta magia, ritual ou postura.",
    tone: "arcane",
    narrativeEffect: "Um fio invisível mantém o efeito ativo.",
  },
  {
    name: "Oculto",
    description: "A criatura está difícil de perceber ou mirar.",
    tone: "neutral",
    narrativeEffect: "Sombras, poeira ou cobertura confundem os sentidos.",
  },
  {
    name: "Marcado",
    description: "A criatura foi escolhida como foco tático.",
    tone: "antique",
    narrativeEffect: "Todos sabem onde a próxima ameaça vai cair.",
  },
  {
    name: "Amaldiçoado",
    description: "Uma força hostil pesa sobre destino e corpo.",
    tone: "ruby",
    narrativeEffect: "A sorte azeda nos detalhes pequenos.",
  },
  {
    name: "Abençoado",
    description: "Uma força protetora favorece a criatura.",
    tone: "ally",
    narrativeEffect: "Uma luz discreta ampara cada gesto.",
  },
];

export const conditionNames = conditions.map((condition) => condition.name);
