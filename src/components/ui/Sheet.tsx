import { X } from "lucide-react";
import { Button } from "./Button";

export function Sheet({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="surface rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-antique">{title}</h2>
        <Button aria-label="Fechar painel" className="h-8 w-8 px-0" type="button" variant="ghost">
          <X size={15} />
        </Button>
      </div>
      {children}
    </aside>
  );
}
