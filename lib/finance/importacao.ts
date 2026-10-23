import { type Categoria, categorizar, type TipoLancamento } from "./categorias";
import { parseDataParaIso, parseValorParaCentavos } from "./dinheiro";

// Limite de linhas por arquivo, aplicado no navegador e de novo no servidor.
export const MAX_LINHAS_IMPORTACAO = 5000;

export type Mapeamento = { data: number; descricao: number; valor: number };

// "negativo-despesa": valores negativos são despesas (padrão da maioria dos extratos).
// "positivo-despesa": valores positivos são despesas (alguns bancos invertem o sinal).
export type ConvencaoSinal = "negativo-despesa" | "positivo-despesa";

export type LancamentoImportado = {
  data: string; // "aaaa-mm-dd"
  descricao: string;
  valorCentavos: number; // sempre positivo
  tipo: TipoLancamento;
  categoria: Categoria;
};

export type ResultadoConversao = {
  validos: LancamentoImportado[];
  invalidas: { linha: number; motivo: string }[];
};

// Converte as linhas de dados (sem cabeçalho) no formato de lançamento.
// Linhas com problema são listadas, não importadas.
export function converterLinhas(
  linhas: string[][],
  mapeamento: Mapeamento,
  convencao: ConvencaoSinal,
): ResultadoConversao {
  const validos: LancamentoImportado[] = [];
  const invalidas: ResultadoConversao["invalidas"] = [];

  linhas.forEach((campos, indice) => {
    const numeroLinha = indice + 2; // +2: linha 1 é o cabeçalho e a contagem começa em 1
    const data = parseDataParaIso(campos[mapeamento.data] ?? "");
    if (!data) {
      invalidas.push({ linha: numeroLinha, motivo: "data inválida" });
      return;
    }

    const descricao = (campos[mapeamento.descricao] ?? "").replace(/\s+/g, " ").trim();
    if (!descricao) {
      invalidas.push({ linha: numeroLinha, motivo: "descrição vazia" });
      return;
    }

    const valorBruto = parseValorParaCentavos(campos[mapeamento.valor] ?? "");
    if (valorBruto === null || valorBruto === 0) {
      invalidas.push({ linha: numeroLinha, motivo: "valor inválido" });
      return;
    }

    const positivoEhReceita = convencao === "negativo-despesa";
    const ehDespesa = positivoEhReceita ? valorBruto < 0 : valorBruto > 0;
    const tipo: TipoLancamento = ehDespesa ? "despesa" : "receita";

    validos.push({
      data,
      descricao: descricao.slice(0, 200),
      valorCentavos: Math.abs(valorBruto),
      tipo,
      categoria: categorizar(descricao, tipo),
    });
  });

  return { validos, invalidas };
}

export function chaveDeDuplicidade(l: {
  data: string;
  descricao: string;
  valorCentavos: number;
  tipo: string;
}): string {
  return `${l.data}|${l.descricao.toLowerCase()}|${l.valorCentavos}|${l.tipo}`;
}

// Separa os lançamentos novos dos que já existem no banco.
// Usa contagem: se o extrato tem 2 compras iguais no mesmo dia e o banco já tem 1,
// só a segunda é importada. Assim não se perdem compras legítimas repetidas.
export function separarNovos<T extends { data: string; descricao: string; valorCentavos: number; tipo: string }>(
  candidatos: T[],
  jaExistentes: { data: string; descricao: string; valorCentavos: number; tipo: string }[],
): { novos: T[]; duplicados: number } {
  const contagem = new Map<string, number>();
  for (const e of jaExistentes) {
    const chave = chaveDeDuplicidade(e);
    contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
  }

  const novos: T[] = [];
  let duplicados = 0;
  for (const c of candidatos) {
    const chave = chaveDeDuplicidade(c);
    const restantes = contagem.get(chave) ?? 0;
    if (restantes > 0) {
      contagem.set(chave, restantes - 1);
      duplicados++;
    } else {
      novos.push(c);
    }
  }
  return { novos, duplicados };
}

// Tenta reconhecer as colunas pelo nome do cabeçalho. -1 significa "não encontrada".
export function sugerirMapeamento(cabecalho: string[]): Mapeamento {
  const normalizar = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const achar = (palavras: string[]) =>
    cabecalho.findIndex((c) => palavras.some((p) => normalizar(c).includes(p)));

  return {
    data: achar(["data", "date", "dt "]),
    descricao: achar(["descricao", "historico", "lancamento", "estabelecimento", "description", "title", "memo", "detalhe"]),
    valor: achar(["valor", "value", "quantia", "amount"]),
  };
}
