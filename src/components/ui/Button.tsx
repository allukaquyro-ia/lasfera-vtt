import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: never;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

type LinkButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "border-ruby-bright/60 bg-ruby text-white shadow-ember hover:bg-ruby-bright",
  secondary: "border-antique/35 bg-antique/10 text-antique hover:bg-antique/20",
  ghost: "border-white/10 bg-white/5 text-stone-200 hover:bg-white/10",
  danger: "border-enemy/50 bg-enemy/15 text-red-100 hover:bg-enemy/25",
};

const base =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-antique/50 disabled:pointer-events-none disabled:opacity-50";

export function Button(props: ButtonProps | LinkButtonProps) {
  const { className, variant = "primary" } = props;
  const classes = cn(base, variants[variant], className);

  if ("href" in props && typeof props.href === "string") {
    const { href, className: _className, variant: _variant, ...linkProps } = props;
    return <Link className={classes} href={href} {...linkProps} />;
  }

  const { className: _className, variant: _variant, ...buttonProps } = props;
  return <button className={classes} {...buttonProps} />;
}
