import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NOME_APP } from "@/lib/config-app";
import "./globals.css";

export const metadata: Metadata = {
  title: NOME_APP,
  description: "Organize suas finanças pessoais com ajuda de IA.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
