"use client";

import { useActionState, useState } from "react";
import { gerarDiagnostico, type EstadoDiagnostico } from "@/app/(app)/dashboard/actions";
import { Alerta } from "./alerta";

// Botão e resultado do diagnóstico com IA. O envio é só o mês e o orçamento para dívidas.
export function DiagnosticoIA({ mes }: { mes: string }) {
  const [estado, acao, pendente] = useActionState<EstadoDiagnostico, FormData>(gerarDiagnostico, null);
  const [orcamento, setOrcamento] = useState("");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Diagnóstico com IA</h2>
      <p className="mt-1 text-sm text-slate-600">
        A IA recebe um resumo com totais e categorias do mês, não o extrato completo. Ela devolve um diagnóstico e até 3 dicas.
      </p>

      <form action={acao} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="mes" value={mes} />
        <label className="text-sm">
          <span className="block font-medium text-slate-700">Pagamento mensal para dívidas (R$, opcional)</span>
          <input
            name="orcamentoDividas"
            value={orcamento}
            onChange={(e) => setOrcamento(e.target.value)}
            placeholder="800,00"
            className="mt-1 w-48 rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={pendente}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {pendente ? "Analisando..." : "Gerar diagnóstico"}
        </button>
      </form>

      {estado && !estado.ok && (
        <div className="mt-4">
          <Alerta tipo="erro">{estado.erro}</Alerta>
        </div>
      )}

      {estado?.ok && (
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="font-medium">Diagnóstico</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{estado.resultado.diagnostico}</p>
          </div>
          <div>
            <h3 className="font-medium">Dicas práticas</h3>
            <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-700">
              {estado.resultado.dicas.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}
