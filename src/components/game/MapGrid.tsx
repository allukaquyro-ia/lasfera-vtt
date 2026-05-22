import { activeTokens } from "@/data/campaign";

export function MapGrid() {
  return (
    <div className="relative min-h-[470px] overflow-hidden rounded-lg border border-antique/20 bg-[#15100f] rune-grid shadow-ember">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(159,18,57,0.2),transparent_45%),linear-gradient(135deg,rgba(201,164,93,0.12),transparent_35%)]" />
      <div className="absolute left-8 top-8 rounded-md border border-antique/25 bg-black/35 px-3 py-2 text-xs uppercase tracking-[0.18em] text-antique">
        Vale Vermelho
      </div>
      {activeTokens.map((token) => (
        <div
          key={token.id}
          className="absolute grid h-12 w-12 place-items-center rounded-full border-2 border-antique bg-ruby text-sm font-bold text-white shadow-ember"
          style={{ left: `${token.x}%`, top: `${token.y}%` }}
          title={token.name}
        >
          {token.name.slice(0, 1)}
        </div>
      ))}
      <div className="absolute bottom-8 right-8 h-20 w-20 rounded-full border border-arcane/40 bg-arcane/15 blur-[1px]" />
    </div>
  );
}
