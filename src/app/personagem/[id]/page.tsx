import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CharacterSheet } from "@/components/game/CharacterSheet";
import { getCharacter } from "@/data/characters";

export default function CharacterPage({ params }: { params: { id: string } }) {
  if (!getCharacter(params.id)) {
    notFound();
  }

  return (
    <AppShell>
      <CharacterSheet id={params.id} />
    </AppShell>
  );
}
