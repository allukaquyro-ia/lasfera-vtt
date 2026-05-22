import { KeyRound, MoonStar } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-ruby-bright/25 bg-black/55 shadow-ember backdrop-blur lg:grid-cols-[1fr_420px]">
        <div className="hidden min-h-[520px] border-r border-white/10 bg-ruby/10 p-8 rune-grid lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="section-title">Campanha #49</p>
            <h2 className="mt-3 text-4xl font-bold text-white">A Jornada no Deserto</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-stone-300">Acesso mockado para a mesa de Lasfera. O foco desta fase e navegar pela experiencia do VTT.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["Mesa", "Ficha", "Mestre"].map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-black/35 p-3 text-sm font-semibold text-stone-200">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="p-7">
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
            <input className="field mt-2" placeholder="jogador@lasfera.app" />
          </label>
          <label className="block text-sm font-semibold text-stone-300">
            Senha
            <input className="field mt-2" placeholder="senha da mesa" type="password" />
          </label>
          <Button className="w-full" href="/loading">
            <KeyRound size={16} />
            Acessar mesa
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-stone-400">
          Novo no circulo? <a className="font-semibold text-antique" href="/register">Criar cadastro</a>
        </p>
        </div>
      </section>
    </main>
  );
}
