import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lasfera VTT",
  description: "Protótipo navegável do VTT de Lasfera RPG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
