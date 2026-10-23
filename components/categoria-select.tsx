"use client";

import { useState, useTransition } from "react";
import { atualizarCategoria } from "@/app/(app)/lancamentos/actions";

type Props = { id: string; valor: string; opcoes: string[] };

// Troca a categoria de um lançamento. Salva na hora e mostra erro se falhar.
export function CategoriaSelect({ id, valor, opcoes }: Props) {
  const [atual, setAtual] = useState(valor);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();

  return (
    <div>
      <select
        value={atual}
        disabled={salvando}
        aria-label="Categoria"
        onChange={(e) => {
          const nova = e.target.value;
          const anterior = atual;
          setAtual(nova);
          setErro(null);
          iniciar(async () => {
            const r = await atualizarCategoria(id, nova);
            if (!r.ok) {
              setAtual(anterior);
              setErro(r.erro);
            }
          });
        }}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm disabled:opacity-60"
      >
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
    </div>
  );
}
