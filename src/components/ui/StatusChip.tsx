import { cn } from "@/lib/utils";

const tones = {
  ally: "border-ally/40 bg-ally/12 text-green-200",
  enemy: "border-enemy/40 bg-enemy/12 text-red-200",
  arcane: "border-arcane/40 bg-arcane/15 text-blue-200",
  ruby: "border-ruby-bright/40 bg-ruby/20 text-rose-200",
  antique: "border-antique/40 bg-antique/12 text-yellow-100",
  neutral: "border-white/15 bg-white/8 text-stone-200",
};

export function StatusChip({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}
