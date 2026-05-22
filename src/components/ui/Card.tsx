import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("surface rounded-lg p-4 md:p-5", className)}>{children}</section>;
}
