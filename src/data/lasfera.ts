import type { LasferaCharacterSheet, LasferaElement } from "@/types/lasfera";

export const elementsCatalog: LasferaElement[] = [
  { name: "Água", tone: "water", description: "Fluxo, cura, memória e pressão.", unlockedAbilities: ["Maré Rubra", "Pulso da Chuva"] },
  { name: "Fogo", tone: "fire", description: "Ímpeto, destruição, paixão e cinzas.", unlockedAbilities: ["Lança Ígnea"] },
  { name: "Terra", tone: "earth", description: "Defesa, peso, raízes e permanência.", unlockedAbilities: ["Muralha Baixa"] },
  { name: "Vento", tone: "wind", description: "Movimento, corte, deslocamento e leitura tática.", unlockedAbilities: ["Passo de Vento"] },
  { name: "Raio", tone: "lightning", description: "Precisão, ruptura, velocidade e impulso.", unlockedAbilities: ["Estalo Fulgurante"] },
  { name: "Luz", tone: "light", description: "Revelação, cura, presença e juramento.", unlockedAbilities: ["Fulgor"] },
  { name: "Sombra", tone: "shadow", description: "Segredo, medo, pacto e ocultação.", unlockedAbilities: ["Véu Escuro"] },
  { name: "Gelo", tone: "ice", description: "Controle, silêncio, preservação e lâmina fria.", unlockedAbilities: ["Selo Frio"] },
  { name: "Magma", tone: "magma", description: "Fusão de fogo e terra, pressão brutal e ruptura.", unlockedAbilities: ["Sangue de Pedra"] },
];

const commonItems = {
  potion: { id: "potion", name: "Elixir Carmesim", type: "consumível" as const, rarity: "incomum" as const, description: "Recupera vigor em uma cena curta.", quantity: 2, equipped: false },
};

export const lasferaSheets: Record<string, LasferaCharacterSheet> = {
  lilith: {
    actorId: "lilith",
    race: "Humana marcada",
    className: "Bruxa Rubra",
    level: 7,
    background: "Herdeira de pacto antigo",
    portrait: "L",
    summary: "Manipula Água como memória viva e carrega uma devoção perigosa ao Dragão Vermelho.",
    primaryElement: "Água",
    elementalLevel: 4,
    absorbedElements: withLevels(["Água", "Sombra", "Gelo"], [4, 2, 1]),
    mysticFusions: ["Água + Sombra: Maré Profana", "Água + Gelo: Prisão de Espelhos"],
    elementalAbilities: [
      { id: "lilith-tide", name: "Maré Rubra", element: "Água", cost: "2 mana", damage: "1d8+3", description: "Uma lâmina líquida corta e drena calor do alvo." },
      { id: "lilith-mirror", name: "Prisão de Espelhos", element: "Gelo", cost: "3 mana", description: "Cria placas frias que atrasam avanço inimigo." },
    ],
    blessings: [
      blessing("dragao-vermelho", "Dragão Vermelho", "Dragão Vermelho", 2, 65, ["Sangue fervente", "Olhar dracônico"], ["Sonhos com brasas antigas"], "A bênção responde a coragem, violência ritual e juramentos cumpridos."),
    ],
    inventory: [
      { id: "grimoire", name: "Grimório Rachado", type: "mágico", rarity: "raro", description: "Contém círculos de água escura e nomes riscados.", quantity: 1, equipped: true },
      { id: "dagger", name: "Adaga Ritual", type: "arma", rarity: "incomum", description: "Fere melhor quando o alvo já sangrou.", quantity: 1, equipped: true },
      commonItems.potion,
    ],
    gold: 38,
    magicStones: 4,
    abilities: [
      { id: "hex-water", name: "Maldição da Maré", type: "magia", cost: "2 mana", range: "18m", damage: "1d8+3", description: "Marca o inimigo com água pesada." },
      { id: "dragon-stage", name: "Fôlego do Dragão Vermelho", type: "bênção", cost: "1 favor", range: "cone curto", damage: "2d6+2", description: "Chamas vermelhas vazam pela voz." },
    ],
    notes: "A água que Lilith controla às vezes reflete cenas que ainda não aconteceram.",
  },
  nero: sheet("nero", "Aureliano", "Estrategista do Vento", 7, "Comandante de cerco", "Vento", "Perfil estratégico, controla rotas e reposiciona aliados.", ["Vento", "Terra"], ["Vento + Terra: Corredor de Poeira"], "Asmodeus"),
  lee: sheet("lee", "Meio-elfo", "Observador Arcano", 6, "Cartógrafo de ruínas", "Raio", "Observador preciso, lê padrões e finaliza alvos vulneráveis.", ["Raio", "Luz"], ["Raio + Luz: Mira Celeste"], "Celestial"),
  jack: sheet("jack", "Humano", "Mercenário Instável", 6, "Duelista de caravana", "Fogo", "Caótico e agressivo, troca segurança por explosão de dano.", ["Fogo", "Magma"], ["Fogo + Magma: Erupção Curta"], "Tiamat"),
  raissa: sheet("raissa", "Silvana", "Oráculo de Sangue Verde", 7, "Vidente do jardim morto", "Luz", "Magia intensa entre suporte e ofensiva, guiada por presságios.", ["Luz", "Água"], ["Luz + Água: Aurora Curativa"], "Priscilla"),
  zak: sheet("zak", "Anão das Dunas", "Guardião Protetor", 5, "Sentinela juramentado", "Terra", "Protetor resistente, segura linhas e absorve impacto.", ["Terra", "Gelo"], ["Terra + Gelo: Bastião Frio"], "Asmodeus"),
};

function withLevels(names: string[], levels: number[]) {
  return names.map((name, index) => ({ ...elementsCatalog.find((element) => element.name === name)!, level: levels[index] ?? 1 }));
}

function blessing(id: string, name: string, deity: string, stage: number, progress: number, activeEffects: string[], permanentEffects: string[], description: string) {
  return {
    id,
    name,
    deity,
    stage,
    progress,
    activeEffects,
    permanentEffects,
    description,
    history: ["Recebida durante uma cena crítica.", "Respondeu a uma escolha difícil."],
  };
}

function sheet(actorId: string, race: string, className: string, level: number, background: string, element: string, summary: string, absorbed: string[], fusions: string[], deity: string): LasferaCharacterSheet {
  return {
    actorId,
    race,
    className,
    level,
    background,
    portrait: actorId.slice(0, 1).toUpperCase(),
    summary,
    primaryElement: element,
    elementalLevel: Math.max(2, level - 3),
    absorbedElements: withLevels(absorbed, absorbed.map((_, index) => Math.max(1, 4 - index))),
    mysticFusions: fusions,
    elementalAbilities: [
      { id: `${actorId}-pulse`, name: `Pulso de ${element}`, element, cost: "1 foco", damage: level > 6 ? "1d10+2" : "1d8+2", description: `Canaliza ${element} em uma ação rápida.` },
      { id: `${actorId}-guard`, name: `Postura de ${element}`, element, cost: "1 reação", description: "Gera vantagem narrativa defensiva por uma troca." },
    ],
    blessings: [blessing(`${actorId}-blessing`, deity, deity, 1 + (level > 6 ? 1 : 0), 45 + level * 5, ["Impulso de favor"], ["Marca sutil na aura"], `Vínculo crescente com ${deity}.`)],
    inventory: [
      { id: `${actorId}-weapon`, name: "Arma Assinada", type: "arma", rarity: "incomum", description: "Ferramenta preferida em combate.", quantity: 1, equipped: true },
      { id: `${actorId}-armor`, name: "Proteção de Viagem", type: "armadura", rarity: "comum", description: "Gasta, mas confiável.", quantity: 1, equipped: true },
      commonItems.potion,
    ],
    gold: 20 + level * 4,
    magicStones: Math.max(1, level - 4),
    abilities: [
      { id: `${actorId}-skill`, name: `Técnica de ${element}`, type: "técnica", cost: "ação", range: "pessoal", damage: "1d8+2", description: "Ataque ou manobra ligada ao estilo do personagem." },
      { id: `${actorId}-support`, name: "Recurso de Cena", type: "elemental", cost: "1 foco", range: "12m", healing: level > 6 ? "1d8+2" : undefined, description: "Uso flexível para vantagem narrativa local." },
    ],
    notes: summary,
  };
}
