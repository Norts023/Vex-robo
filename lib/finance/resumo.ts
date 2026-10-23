import type { TipoLancamento } from "./categorias";

export type Lancamento = {
  data: string; // "aaaa-mm-dd"
  valorCentavos: number; // sempre positivo
  tipo: TipoLancamento;
  categoria: string;
};

export function mesDe(data: string): string {
  return data.slice(0, 7);
}

// Gastos (despesas) somados por categoria, do maior para o menor.
export function gastosPorCategoria(lancamentos: Lancamento[], mes?: string) {
  const totais = new Map<string, number>();
  for (const l of lancamentos) {
    if (l.tipo !== "despesa") continue;
    if (mes && mesDe(l.data) !== mes) continue;
    totais.set(l.categoria, (totais.get(l.categoria) ?? 0) + l.valorCentavos);
  }
  return [...totais.entries()]
    .map(([categoria, totalCentavos]) => ({ categoria, totalCentavos }))
    .sort((a, b) => b.totalCentavos - a.totalCentavos);
}

// Receitas e despesas de cada mês, em ordem cronológica.
export function totaisPorMes(lancamentos: Lancamento[]) {
  const porMes = new Map<string, { receitasCentavos: number; despesasCentavos: number }>();
  for (const l of lancamentos) {
    const mes = mesDe(l.data);
    const atual = porMes.get(mes) ?? { receitasCentavos: 0, despesasCentavos: 0 };
    if (l.tipo === "receita") atual.receitasCentavos += l.valorCentavos;
    else atual.despesasCentavos += l.valorCentavos;
    porMes.set(mes, atual);
  }
  return [...porMes.entries()]
    .map(([mes, t]) => ({ mes, ...t }))
    .sort((a, b) => a.mes.localeCompare(b.mes));
}

export function resumoDoMes(lancamentos: Lancamento[], mes: string) {
  const doMes = lancamentos.filter((l) => mesDe(l.data) === mes);
  const receitasCentavos = doMes
    .filter((l) => l.tipo === "receita")
    .reduce((s, l) => s + l.valorCentavos, 0);
  const despesasCentavos = doMes
    .filter((l) => l.tipo === "despesa")
    .reduce((s, l) => s + l.valorCentavos, 0);
  return { receitasCentavos, despesasCentavos, saldoCentavos: receitasCentavos - despesasCentavos };
}

// Lista de meses "aaaa-mm" do mais antigo ao atual, terminando em `ate`.
export function ultimosMeses(ate: string, quantidade: number): string[] {
  const [ano, mes] = ate.split("-").map(Number);
  const meses: string[] = [];
  for (let i = quantidade - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(ano, mes - 1 - i, 1));
    meses.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return meses;
}
