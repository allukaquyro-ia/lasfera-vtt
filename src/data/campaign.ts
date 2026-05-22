import { characters } from "./characters";

export const campaign = {
  number: 49,
  title: "A Jornada no Deserto",
  location: "Ruinas de Khar-Nhal",
  phase: "Noite 3",
  threat: "Arauto sob as dunas",
  objective: "Cruzar o vale vermelho antes que a segunda lua desapareca.",
};

export const activeTokens = characters.map((character, index) => ({
  id: character.id,
  name: character.name,
  side: character.side,
  x: 18 + index * 11,
  y: 28 + (index % 2) * 18,
}));

export const logs = [
  "Lilith rolou Arcanismo: 18",
  "Nero sofreu 6 de dano perfurante",
  "Raissa ativou Cura de Hera",
  "Jack marcou o inimigo principal",
  "Lee detectou magia azul no obelisco",
];

export const libraryCategories = [
  { title: "Regras", count: 18, tone: "ruby" },
  { title: "Magias", count: 42, tone: "arcane" },
  { title: "Criaturas", count: 31, tone: "enemy" },
  { title: "Itens", count: 27, tone: "antique" },
  { title: "Elementos", count: 9, tone: "ally" },
  { title: "Cenarios", count: 12, tone: "graphite" },
];
