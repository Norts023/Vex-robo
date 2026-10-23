import Link from "next/link";
import type { ReactNode } from "react";
import { NOME_APP } from "@/lib/config-app";

type Props = {
  titulo: string;
  descricao?: string;
  children: ReactNode;
  rodape?: { texto: string; href: string; rotulo: string };
};

// Moldura comum às telas de login, cadastro e recuperação de senha.
export function CartaoAuth({ titulo, descricao, children, rodape }: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <p className="mb-6 text-center text-lg font-semibold tracking-tight text-emerald-700">{NOME_APP}</p>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
          {descricao && <p className="mt-2 text-sm text-slate-600">{descricao}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {rodape && (
          <p className="mt-6 text-center text-sm text-slate-600">
            {rodape.texto}{" "}
            <Link href={rodape.href} className="font-medium text-emerald-700 hover:underline">
              {rodape.rotulo}
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
