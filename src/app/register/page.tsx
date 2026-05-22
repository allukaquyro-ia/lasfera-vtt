import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-2xl rounded-lg border border-antique/25 bg-black/55 p-7 shadow-ember backdrop-blur">
        <div className="mb-6">
          <p className="section-title">Cadastro</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Criar aventureiro</h1>
          <p className="mt-2 text-sm text-stone-400">Formulario visual mockado para entrada na mesa.</p>
        </div>

        <form className="grid gap-4 md:grid-cols-2">
          {["Nome", "Email", "Personagem", "Senha"].map((field) => (
            <label key={field} className="block text-sm font-semibold text-stone-300">
              {field}
              <input
                className="field mt-2"
                type={field === "Senha" ? "password" : "text"}
              />
            </label>
          ))}
          <Button className="md:col-span-2" href="/loading">
            <ScrollText size={16} />
            Salvar cadastro mockado
          </Button>
        </form>
      </section>
    </main>
  );
}
