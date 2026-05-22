import { KeyRound, MoonStar } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-ruby-bright/25 bg-black/55 p-7 shadow-ember backdrop-blur">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-md border border-antique/45 bg-ruby/30 text-antique">
            <MoonStar size={26} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-antique">Lasfera VTT</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Entrar na campanha</h1>
        </div>

        <form className="space-y-4">
          <label className="block text-sm font-semibold text-stone-300">
            Email
            <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-antique/60" placeholder="jogador@lasfera.app" />
          </label>
          <label className="block text-sm font-semibold text-stone-300">
            Senha
            <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-antique/60" placeholder="senha da mesa" type="password" />
          </label>
          <Button className="w-full" href="/loading">
            <KeyRound size={16} />
            Acessar mesa
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-stone-400">
          Novo no circulo? <a className="font-semibold text-antique" href="/register">Criar cadastro</a>
        </p>
      </section>
    </main>
  );
}
