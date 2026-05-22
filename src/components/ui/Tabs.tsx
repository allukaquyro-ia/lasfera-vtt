"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  label: string;
  content: React.ReactNode;
};

export function Tabs({ items }: { items: TabItem[] }) {
  const [active, setActive] = useState(items[0]?.label);
  const activeItem = items.find((item) => item.label === active) ?? items[0];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto rounded-lg border border-white/10 bg-black/30 p-1">
        {items.map((item) => (
          <button
            key={item.label}
            className={cn(
              "h-10 shrink-0 rounded-md px-3 text-sm font-semibold text-stone-300 transition hover:bg-white/5",
              active === item.label && "bg-ruby text-white shadow-ember",
            )}
            onClick={() => setActive(item.label)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <div>{activeItem.content}</div>
    </div>
  );
}
