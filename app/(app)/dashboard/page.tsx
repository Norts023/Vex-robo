import { DiagnosticoIA } from "@/components/diagnostico-ia";
import { formatarReais } from "@/lib/finance/dinheiro";
import { gastosPorCategoria, type Lancamento, resumoDoMes, totaisPorMes, ultimosMeses } from "@/lib/finance/resumo";
import { exigirUsuario } from "@/lib/supabase/usuario";

type Props = { searchParams: Promise<{ mes?: string }> };

const MESES_NOMES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function nomeDoMes(mes: string) {
  const [ano, m] = mes.split("-");
  return `${MESES_NOMES[Number(m) - 1]}/${ano}`;
}

export default async function PaginaDashboard({ searchParams }: Props) {
  const { mes: mesParam } = await searchParams;
  const { supabase } = await exigirUsuario();

  const mesAtual = new Date().toISOString().slice(0, 7);
  const mesValido = /^\d{4}-\d{2}$/.test(mesParam ?? "") ? (mesParam as string) : mesAtual;
  const ultimos12 = ultimosMeses(mesValido, 12);
  const opcoesMes = ultimosMeses(mesAtual, 24).reverse();

  const { data } = await supabase
    .from("transactions")
    .select("data, valor, tipo, categoria")
    .gte("data", `${ultimos12[0]}-01`)
    .lte("data", `${mesValido}-31`);

  const lancamentos: Lancamento[] = (data ?? []).map((t) => ({
    data: String(t.data),
    valorCentavos: Math.round(Number(t.valor) * 100),
    tipo: t.tipo,
    categoria: String(t.categoria),
  }));

  const resumo = resumoDoMes(lancamentos, mesValido);
  const categorias = gastosPorCategoria(lancamentos, mesValido);
  const maiorCategoria = Math.max(1, ...categorias.map((c) => c.totalCentavos));

  const porMes = totaisPorMes(lancamentos);
  const serieMeses = ultimos12.map((mes) => ({
    mes,
    despesasCentavos: porMes.find((t) => t.mes === mes)?.despesasCentavos ?? 0,
  }));
  const maiorMes = Math.max(1, ...serieMeses.map((s) => s.despesasCentavos));

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Painel</h1>
          <p className="mt-1 text-sm text-slate-600">Resumo de {nomeDoMes(mesValido)}</p>
        </div>
        <form method="get" className="flex items-center gap-2">
          <select name="mes" defaultValue={mesValido} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
            {opcoesMes.map((m) => (
              <option key={m} value={m}>
                {nomeDoMes(m)}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">
            Ver mês
          </button>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Indicador titulo="Receitas" valor={formatarReais(resumo.receitasCentavos)} cor="text-emerald-700" />
        <Indicador titulo="Despesas" valor={formatarReais(resumo.despesasCentavos)} cor="text-red-600" />
        <Indicador
          titulo="Saldo"
          valor={formatarReais(resumo.saldoCentavos)}
          cor={resumo.saldoCentavos >= 0 ? "text-emerald-700" : "text-red-600"}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Cartao titulo="Gastos por categoria">
          {categorias.length === 0 ? (
            <Vazio>Nenhuma despesa neste mês. Importe um extrato para começar.</Vazio>
          ) : (
            <ul className="space-y-3">
              {categorias.map((c) => (
                <li key={c.categoria}>
                  <div className="flex justify-between text-sm">
                    <span>{c.categoria}</span>
                    <span className="tabular-nums text-slate-600">{formatarReais(c.totalCentavos)}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${(c.totalCentavos / maiorCategoria) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao titulo="Despesas nos últimos 12 meses">
          <div className="flex h-56 items-end gap-1.5">
            {serieMeses.map((s) => (
              <div key={s.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${nomeDoMes(s.mes)}: ${formatarReais(s.despesasCentavos)}`}>
                <div
                  className={`w-full rounded-t ${s.mes === mesValido ? "bg-emerald-600" : "bg-emerald-300"}`}
                  style={{ height: `${(s.despesasCentavos / maiorMes) * 100}%`, minHeight: s.despesasCentavos > 0 ? "2px" : "0" }}
                />
                <span className="text-[10px] text-slate-500">{MESES_NOMES[Number(s.mes.slice(5)) - 1]}</span>
              </div>
            ))}
          </div>
        </Cartao>
      </section>

      <DiagnosticoIA mes={mesValido} />
    </main>
  );
}

function Indicador({ titulo, valor, cor }: { titulo: string; valor: string; cor: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-600">{titulo}</p>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${cor}`}>{valor}</p>
    </div>
  );
}

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{titulo}</h2>
      {children}
    </div>
  );
}

function Vazio({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}
