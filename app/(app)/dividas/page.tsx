import { criarDivida, excluirDivida } from "./actions";
import { FormularioAuth } from "@/components/formulario-auth";
import { compararEstrategias, type Divida, type ResultadoQuitacao } from "@/lib/finance/divida";
import { formatarReais, parseValorParaCentavos } from "@/lib/finance/dinheiro";
import { exigirUsuario } from "@/lib/supabase/usuario";

type Props = { searchParams: Promise<{ orcamento?: string }> };

export default async function PaginaDividas({ searchParams }: Props) {
  const { orcamento } = await searchParams;
  const { supabase } = await exigirUsuario();

  const { data } = await supabase
    .from("debts")
    .select("id, nome, saldo, taxa_juros_mensal, parcela_minima")
    .order("criado_em", { ascending: true });

  const dividas: Divida[] = (data ?? []).map((d) => ({
    id: String(d.id),
    nome: String(d.nome),
    saldoCentavos: Math.round(Number(d.saldo) * 100),
    taxaJurosMensal: Number(d.taxa_juros_mensal),
    parcelaMinimaCentavos: Math.round(Number(d.parcela_minima) * 100),
  }));

  const somaMinimos = dividas.reduce((s, d) => s + d.parcelaMinimaCentavos, 0);
  const orcamentoCentavos = orcamento ? parseValorParaCentavos(orcamento) : null;
  const orcamentoUsado = orcamentoCentavos && orcamentoCentavos > 0 ? orcamentoCentavos : somaMinimos;
  const cenarios = dividas.length > 0 ? compararEstrategias(dividas, orcamentoUsado) : null;

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dívidas</h1>
        <p className="mt-1 text-sm text-slate-600">
          Cadastre cartões, empréstimos e cheque especial. Taxa em % ao mês.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Suas dívidas</h2>
        {dividas.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma dívida cadastrada ainda.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {dividas.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium">{d.nome}</p>
                  <p className="text-slate-600">
                    Saldo {formatarReais(d.saldoCentavos)} · {String(d.taxaJurosMensal).replace(".", ",")}% ao mês · mínimo{" "}
                    {formatarReais(d.parcelaMinimaCentavos)}
                  </p>
                </div>
                <form action={excluirDivida.bind(null, d.id)}>
                  <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
                    Excluir
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="mb-4 font-medium">Adicionar dívida</h3>
          <FormularioAuth
            acao={criarDivida}
            textoBotao="Salvar dívida"
            campos={[
              { name: "nome", label: "Nome", placeholder: "Ex.: Cartão Nubank" },
              { name: "saldo", label: "Saldo devedor (R$)", placeholder: "1500,00" },
              { name: "taxa", label: "Taxa de juros mensal (%)", placeholder: "12,5" },
              { name: "parcela", label: "Parcela mínima (R$)", placeholder: "250,00" },
            ]}
          />
        </div>
      </section>

      {dividas.length > 0 && cenarios && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">Plano de quitação</h2>
            <p className="mt-1 text-sm text-slate-600">
              Compare a bola de neve (menor saldo primeiro) com a avalanche (maior juros primeiro).
            </p>
          </div>

          <form method="get" className="flex flex-wrap items-end gap-2">
            <label className="text-sm">
              <span className="block font-medium text-slate-700">Quanto você consegue pagar por mês no total (R$)?</span>
              <input
                name="orcamento"
                defaultValue={orcamentoCentavos ? (orcamentoCentavos / 100).toFixed(2).replace(".", ",") : (somaMinimos / 100).toFixed(2).replace(".", ",")}
                className="mt-1 w-48 rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">
              Calcular
            </button>
          </form>
          <p className="text-xs text-slate-500">
            A soma das parcelas mínimas é {formatarReais(somaMinimos)}. O valor precisa ser igual ou maior que isso.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <Cenario titulo="Bola de neve" subtitulo="Menor saldo primeiro" r={cenarios.bolaDeNeve} dividas={dividas} />
            <Cenario titulo="Avalanche" subtitulo="Maior juros primeiro" r={cenarios.avalanche} dividas={dividas} />
          </div>
        </section>
      )}
    </main>
  );
}

function Cenario({
  titulo,
  subtitulo,
  r,
  dividas,
}: {
  titulo: string;
  subtitulo: string;
  r: ResultadoQuitacao;
  dividas: Divida[];
}) {
  const nomes = new Map(dividas.map((d) => [d.id, d.nome]));

  if (!r.viavel) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p className="font-semibold">{titulo}</p>
        <p className="mt-1">
          {r.motivo === "orcamento-insuficiente"
            ? "O valor mensal não cobre as parcelas mínimas."
            : "Com esse valor mensal, a dívida não é quitada em 50 anos. O juros consome o pagamento."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="font-semibold">{titulo}</p>
      <p className="text-xs text-slate-500">{subtitulo}</p>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-600">Tempo estimado</dt>
          <dd className="text-lg font-semibold tabular-nums">
            {r.meses} {r.meses === 1 ? "mês" : "meses"}
          </dd>
        </div>
        <div>
          <dt className="text-slate-600">Total de juros</dt>
          <dd className="text-lg font-semibold tabular-nums text-red-600">{formatarReais(r.totalJurosCentavos)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-slate-600">Total pago</dt>
          <dd className="tabular-nums">{formatarReais(r.totalPagoCentavos)}</dd>
        </div>
      </dl>
      {r.ordem.length > 0 && (
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-slate-700">
          {r.ordem.map((o) => (
            <li key={o.id}>
              {nomes.get(o.id) ?? o.nome}: quitada no mês {o.mesQuitacao}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
