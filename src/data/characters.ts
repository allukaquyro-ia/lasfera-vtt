export type CharacterRole = "Jogador" | "Mestre";
export type CharacterSide = "ally" | "enemy" | "neutral";

export type Character = {
  id: string;
  name: string;
  player: string;
  className: string;
  level: number;
  hp: number;
  maxHp: number;
  armor: number;
  side: CharacterSide;
  status: string;
  online: boolean;
  element: string;
  attributes: Record<string, number>;
  spells: string[];
  inventory: string[];
  blessings: string[];
  notes: string;
};

export const characters: Character[] = [
  {
    id: "lilith",
    name: "Lilith",
    player: "Ana",
    className: "Bruxa Rubra",
    level: 7,
    hp: 42,
    maxHp: 54,
    armor: 15,
    side: "ally",
    status: "Concentrada",
    online: true,
    element: "Sangue e fogo",
    attributes: { Forca: 1, Agilidade: 3, Vigor: 2, Intelecto: 5, Presenca: 4, Sombra: 5 },
    spells: ["Marca Carmesim", "Voz da Cinza", "Circulo de Lacre"],
    inventory: ["Grimorio rachado", "Adaga ritual", "3 velas negras"],
    blessings: ["Pacto da Lua Partida"],
    notes: "Ouviu o nome verdadeiro do arauto sob as dunas.",
  },
  {
    id: "nero",
    name: "Nero",
    player: "Bruno",
    className: "Guardiao de Ferro",
    level: 7,
    hp: 66,
    maxHp: 72,
    armor: 18,
    side: "ally",
    status: "Ferido",
    online: true,
    element: "Metal antigo",
    attributes: { Forca: 5, Agilidade: 2, Vigor: 5, Intelecto: 2, Presenca: 3, Sombra: 1 },
    spells: ["Postura Inabalavel"],
    inventory: ["Escudo de torre", "Espada lascada", "Medalhao do forte"],
    blessings: ["Juramento de Sal"],
    notes: "Protege o grupo, mas a armadura esta rangendo com magia azul.",
  },
  {
    id: "lee",
    name: "Lee",
    player: "Carol",
    className: "Andarilho Arcano",
    level: 6,
    hp: 31,
    maxHp: 39,
    armor: 14,
    side: "ally",
    status: "Acelerado",
    online: false,
    element: "Vento azul",
    attributes: { Forca: 1, Agilidade: 5, Vigor: 2, Intelecto: 4, Presenca: 3, Sombra: 3 },
    spells: ["Passo Impossivel", "Seta Fria", "Mapa das Estrelas"],
    inventory: ["Bussola sem norte", "Corda fina", "Dardos de vidro"],
    blessings: ["Benção do Horizonte"],
    notes: "Encontrou rastros recentes perto do obelisco.",
  },
  {
    id: "jack",
    name: "Jack",
    player: "Diego",
    className: "Mercenario Solar",
    level: 6,
    hp: 48,
    maxHp: 52,
    armor: 16,
    side: "ally",
    status: "Pronto",
    online: true,
    element: "Luz cortante",
    attributes: { Forca: 4, Agilidade: 4, Vigor: 3, Intelecto: 2, Presenca: 4, Sombra: 2 },
    spells: ["Golpe Radiante"],
    inventory: ["Sabre dourado", "Pistola velha", "Baralho marcado"],
    blessings: ["Favor do Sol Baixo"],
    notes: "Deve dinheiro a alguem dentro da caravana.",
  },
  {
    id: "raissa",
    name: "Raissa",
    player: "Eva",
    className: "Oraculo Verde",
    level: 7,
    hp: 37,
    maxHp: 45,
    armor: 13,
    side: "ally",
    status: "Inspirada",
    online: true,
    element: "Raiz e pressagio",
    attributes: { Forca: 2, Agilidade: 2, Vigor: 3, Intelecto: 4, Presenca: 5, Sombra: 3 },
    spells: ["Cura de Hera", "Olho do Poco", "Sussurro da Terra"],
    inventory: ["Cajado vivo", "Sementes prateadas", "Manto de viagem"],
    blessings: ["Jardim que Lembra"],
    notes: "Sente uma presenca inimiga nos sonhos do grupo.",
  },
  {
    id: "zak",
    name: "Zak",
    player: "NPC",
    className: "Batedor das Dunas",
    level: 5,
    hp: 29,
    maxHp: 34,
    armor: 14,
    side: "neutral",
    status: "Observando",
    online: false,
    element: "Areia muda",
    attributes: { Forca: 2, Agilidade: 5, Vigor: 2, Intelecto: 3, Presenca: 2, Sombra: 4 },
    spells: ["Sumir na Poeira"],
    inventory: ["Arco curto", "Mascara de linho", "Mapa rasgado"],
    blessings: ["Nenhuma"],
    notes: "Conhece uma entrada lateral para as ruinas.",
  },
];

export function getCharacter(id: string) {
  return characters.find((character) => character.id === id);
}
