import { BookMarked } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { libraryCategories } from "@/data/campaign";

export default function BibliotecaPage() {
  return (
    <AppShell>
      <div className="mb-5">
        <p className="section-title">Biblioteca</p>
        <h1 className="mt-1 text-3xl font-bold text-white">Compendio de Lasfera</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-400">Categorias mockadas para consulta durante a mesa. O conteudo real entra depois do modelo de dados.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {libraryCategories.map((category) => (
          <Card key={category.title} className="min-h-44">
            <div className="mb-5 flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-md border border-antique/30 bg-ruby/20 text-antique">
                <BookMarked size={22} />
              </div>
              <StatusChip tone="neutral">{category.count} entradas</StatusChip>
            </div>
            <h2 className="text-2xl font-bold text-white">{category.title}</h2>
            <p className="mt-2 text-sm text-stone-400">Conteudo mockado para consulta rapida durante a campanha.</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
