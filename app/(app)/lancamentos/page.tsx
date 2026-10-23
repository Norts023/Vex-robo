import Link from "next/link";
import { CategoriaSelect } from "@/components/categoria-select";
import { CATEGORIAS_DESPESA, CATEGORIAS_RECEITA } from "@/lib/finance/categorias";
import { formatarReais } from "@/lib/finance/dinheiro";
import { exigirUsuario } from "@/lib/supabase/usuario";

const LIMITE = 300;

export default async function PaginaLancamentos() {
  const { supabase } = await exigirUsuario();

  const { data } = await supabase
    .from("transactions")
    .select("id, data, descricao, valor, tipo, categoria")
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false })
    .limit(LIMITE);

  const lancamentos = data ?? [];

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lançamentos</h1>
        <p className="mt-1 text-sm text-slate-600">
          Os {LIMITE} lançamentos mais recentes. Se a categoria automática estiver errada, troque aqui.
        </p>
      </div>

      {lancamentos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          Nenhum lançamento ainda.{" "}
          <Link href="/importar" className="font-medium text-emerald-700 hover:underline">
            Importar um extrato
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lancamentos.map((l) => {
                const valorCentavos = Math.round(Number(l.valor) * 100);
                const opcoes = l.tipo === "receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
                return (
                  <tr key={l.id}>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">
                      {new Date(`${l.data}T00:00:00`).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">{l.descricao}</td>
                    <td className="px-4 py-3">
                      <CategoriaSelect id={l.id} valor={l.categoria} opcoes={[...opcoes]} />
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right tabular-nums ${
                        l.tipo === "receita" ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {l.tipo === "despesa" ? "−" : "+"} {formatarReais(valorCentavos)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
