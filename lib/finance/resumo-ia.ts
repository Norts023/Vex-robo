import { formatarReais } from "./dinheiro";
import { gastosPorCategoria, type Lancamento, resumoDoMes, totaisPorMes, ultimosMeses } from "./resumo";
import { compararEstrategias, type Divida } from "./divida";

// Monta o resumo numérico enviado à IA.
// Não inclui descrições de lançamentos nem nomes de dívidas: só totais, categorias e prazos.
export function montarResumoParaIA(entrada: {
  mes: string;
  lancamentos: Lancamento[];
  dividas: Divida[];
  orcamentoDividasCentavos?: number;
}) {
  const { mes, lancamentos, dividas, orcamentoDividasCentavos } = entrada;
  const doMes = resumoDoMes(lancamentos, mes);

  const ultimos3 = ultimosMeses(mes, 3);
  const totaisRecentes = totaisPorMes(lancamentos).filter((t) => ultimos3.includes(t.mes));
  const mediaDespesas3Meses =
    totaisRecentes.length > 0
      ? totaisRecentes.reduce((s, t) => s + t.despesasCentavos, 0) / totaisRecentes.length
      : 0;

  const saldoDividas = dividas.reduce((s, d) => s + d.saldoCentavos, 0);
  const parcelasMinimas = dividas.reduce((s, d) => s + d.parcelaMinimaCentavos, 0);

  const resumo: Record<string, unknown> = {
    mesDeReferencia: mes,
    receitasDoMes: formatarReais(doMes.receitasCentavos),
    despesasDoMes: formatarReais(doMes.despesasCentavos),
    saldoDoMes: formatarReais(doMes.saldoCentavos),
    mediaMensalDeDespesasUltimos3Meses: formatarReais(Math.round(mediaDespesas3Meses)),
    principaisCategoriasDeGastoNoMes: gastosPorCategoria(lancamentos, mes)
      .slice(0, 5)
      .map((c) => ({ categoria: c.categoria, valor: formatarReais(c.totalCentavos) })),
    dividas: {
      quantidade: dividas.length,
      saldoTotal: formatarReais(saldoDividas),
      somaDasParcelasMinimas: formatarReais(parcelasMinimas),
    },
  };

  if (dividas.length > 0 && orcamentoDividasCentavos !== undefined) {
    const { bolaDeNeve, avalanche } = compararEstrategias(dividas, orcamentoDividasCentavos);
    const cenario = (r: { viavel: boolean; meses: number; totalJurosCentavos: number }) =>
      r.viavel
        ? { quitacaoEmMeses: r.meses, totalDeJuros: formatarReais(r.totalJurosCentavos) }
        : { quitacaoEmMeses: null, totalDeJuros: null };

    resumo.planoDeQuitacao = {
      orcamentoMensalParaDividas: formatarReais(orcamentoDividasCentavos),
      bolaDeNeve: cenario(bolaDeNeve),
      avalanche: cenario(avalanche),
    };
  }

  return resumo;
}
