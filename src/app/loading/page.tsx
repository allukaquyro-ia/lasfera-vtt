import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { campaign } from "@/data/campaign";

export default function LoadingPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-8 grid h-24 w-24 place-items-center rounded-full border border-ruby-bright/35 bg-ruby/20 shadow-ember">
          <LoaderCircle className="animate-spin text-antique" size={42} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-antique">Campanha #{campaign.number}</p>
        <h1 className="mt-3 text-4xl font-bold text-white md:text-6xl">{campaign.title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-300">{campaign.objective}</p>
        <div className="mt-8">
          <Button href="/dashboard">Abrir dashboard</Button>
        </div>
      </section>
    </main>
  );
}
