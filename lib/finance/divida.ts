// Simulação mês a mês do plano de quitação de dívidas.
//
// Regras de cada mês:
// 1. Os juros do mês são somados ao saldo de cada dívida em aberto.
// 2. Todas as dívidas recebem a parcela mínima (limitada ao saldo).
// 3. O restante do orçamento vai para a dívida prioritária da estratégia.
//    Se ela for quitada, a sobra passa para a próxima.
//
// Bola de neve: prioridade para o menor saldo.
// Avalanche: prioridade para a maior taxa de juros (desempate pelo menor saldo).
//
// Valores em centavos. A taxa é mensal, em percentual (12.5 = 12,5% ao mês).

export type Divida = {
  id: string;
  nome: string;
  saldoCentavos: number;
  taxaJurosMensal: number;
  parcelaMinimaCentavos: number;
};

export type Estrategia = "bola-de-neve" | "avalanche";

export type ResultadoQuitacao = {
  estrategia: Estrategia;
  viavel: boolean;
  motivo?: "orcamento-insuficiente" | "nao-quita-no-prazo";
  meses: number;
  totalJurosCentavos: number;
  totalPagoCentavos: number;
  // Em que mês cada dívida foi quitada, na ordem em que foram quitadas.
  ordem: { id: string; nome: string; mesQuitacao: number }[];
};

// Limite de segurança: 50 anos. Evita laço infinito quando o orçamento não cobre os juros.
const LIMITE_MESES = 600;

type EstadoDivida = {
  id: string;
  nome: string;
  saldo: number;
  taxa: number;
  minimo: number;
  quitadaEm: number | null;
};

export function simularQuitacao(
  dividas: Divida[],
  orcamentoMensalCentavos: number,
  estrategia: Estrategia,
): ResultadoQuitacao {
  const abertas = dividas.filter((d) => d.saldoCentavos > 0);
  const somaMinimos = abertas.reduce((soma, d) => soma + d.parcelaMinimaCentavos, 0);

  const base = { estrategia, totalJurosCentavos: 0, totalPagoCentavos: 0, ordem: [] as ResultadoQuitacao["ordem"] };

  if (abertas.length === 0) {
    return { ...base, viavel: true, meses: 0 };
  }

  if (orcamentoMensalCentavos < somaMinimos) {
    return { ...base, viavel: false, motivo: "orcamento-insuficiente", meses: 0 };
  }

  const estado: EstadoDivida[] = abertas.map((d) => ({
    id: d.id,
    nome: d.nome,
    saldo: d.saldoCentavos,
    taxa: d.taxaJurosMensal,
    minimo: d.parcelaMinimaCentavos,
    quitadaEm: null,
  }));

  const prioridade = (a: EstadoDivida, b: EstadoDivida) =>
    estrategia === "bola-de-neve" ? a.saldo - b.saldo : b.taxa - a.taxa || a.saldo - b.saldo;

  let mes = 0;
  let juros = 0;
  let pago = 0;

  while (estado.some((d) => d.saldo > 0)) {
    if (mes >= LIMITE_MESES) {
      return {
        ...base,
        viavel: false,
        motivo: "nao-quita-no-prazo",
        meses: mes,
        totalJurosCentavos: juros,
        totalPagoCentavos: pago,
      };
    }
    mes++;

    for (const d of estado) {
      if (d.saldo <= 0) continue;
      const jurosDoMes = Math.round((d.saldo * d.taxa) / 100);
      d.saldo += jurosDoMes;
      juros += jurosDoMes;
    }

    const ordem = estado.filter((d) => d.saldo > 0).sort(prioridade);
    let disponivel = orcamentoMensalCentavos;

    for (const d of ordem) {
      const minimo = Math.min(d.minimo, d.saldo);
      d.saldo -= minimo;
      disponivel -= minimo;
      pago += minimo;
    }

    for (const d of ordem) {
      if (disponivel <= 0) break;
      const extra = Math.min(disponivel, d.saldo);
      d.saldo -= extra;
      disponivel -= extra;
      pago += extra;
    }

    for (const d of estado) {
      if (d.saldo <= 0 && d.quitadaEm === null) d.quitadaEm = mes;
    }
  }

  const ordemQuitacao = estado
    .filter((d) => d.quitadaEm !== null)
    .sort((a, b) => (a.quitadaEm ?? 0) - (b.quitadaEm ?? 0))
    .map((d) => ({ id: d.id, nome: d.nome, mesQuitacao: d.quitadaEm ?? 0 }));

  return {
    ...base,
    viavel: true,
    meses: mes,
    totalJurosCentavos: juros,
    totalPagoCentavos: pago,
    ordem: ordemQuitacao,
  };
}

export function compararEstrategias(dividas: Divida[], orcamentoMensalCentavos: number) {
  return {
    bolaDeNeve: simularQuitacao(dividas, orcamentoMensalCentavos, "bola-de-neve"),
    avalanche: simularQuitacao(dividas, orcamentoMensalCentavos, "avalanche"),
  };
}
