import Link from "next/link";
import type { ReactNode } from "react";
import { sair } from "@/app/auth/actions";
import { NOME_APP } from "@/lib/config-app";
import { exigirUsuario } from "@/lib/supabase/usuario";

const LINKS = [
  { href: "/dashboard", rotulo: "Painel" },
  { href: "/importar", rotulo: "Importar" },
  { href: "/lancamentos", rotulo: "Lançamentos" },
  { href: "/dividas", rotulo: "Dívidas" },
  { href: "/conta", rotulo: "Conta" },
];

// Moldura das telas autenticadas: menu, aviso fixo e proteção de acesso.
export default async function LayoutApp({ children }: { children: ReactNode }) {
  await exigirUsuario();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/dashboard" className="font-semibold tracking-tight text-emerald-700">
            {NOME_APP}
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-slate-600 hover:text-slate-900">
                {l.rotulo}
              </Link>
            ))}
            <form action={sair}>
              <button type="submit" className="font-medium text-slate-600 hover:text-slate-900">
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-slate-200 bg-white">
        <p className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-500">
          O {NOME_APP} oferece educação financeira e organização. Não é recomendação de investimentos.
        </p>
      </footer>
    </div>
  );
}
