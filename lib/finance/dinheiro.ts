// Valores monetários são guardados em centavos (inteiros) para evitar erros de arredondamento.

const formatadorBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarReais(centavos: number): string {
  return formatadorBRL.format(centavos / 100);
}

// Aceita formatos comuns de extrato: "1.234,56", "1234.56", "-89,90", "R$ 12,00", "(45,00)".
// Retorna null quando o texto não é um valor.
export function parseValorParaCentavos(entrada: string): number | null {
  let texto = entrada.trim();
  if (!texto) return null;

  let negativo = false;
  if (/^\(.*\)$/.test(texto)) {
    negativo = true;
    texto = texto.slice(1, -1);
  }

  texto = texto.replace(/R\$/i, "").replace(/\s/g, "");
  if (texto.startsWith("-")) {
    negativo = !negativo;
    texto = texto.slice(1);
  } else if (texto.startsWith("+")) {
    texto = texto.slice(1);
  }

  if (!/^\d[\d.,]*$/.test(texto)) return null;

  const ultimaVirgula = texto.lastIndexOf(",");
  const ultimoPonto = texto.lastIndexOf(".");
  let numero: string;

  if (ultimaVirgula >= 0 && ultimoPonto >= 0) {
    // O separador que aparece por último é o decimal; o outro é de milhar.
    numero =
      ultimaVirgula > ultimoPonto
        ? texto.replace(/\./g, "").replace(",", ".")
        : texto.replace(/,/g, "");
  } else if (ultimaVirgula >= 0) {
    numero = /^\d{1,3}(,\d{3})+$/.test(texto) ? texto.replace(/,/g, "") : texto.replace(",", ".");
  } else if (ultimoPonto >= 0) {
    numero = /^\d{1,3}(\.\d{3})+$/.test(texto) ? texto.replace(/\./g, "") : texto;
  } else {
    numero = texto;
  }

  const valor = Number(numero);
  if (!Number.isFinite(valor)) return null;

  const centavos = Math.round(valor * 100);
  return negativo ? -centavos : centavos;
}

// Aceita dd/mm/aaaa, dd/mm/aa e aaaa-mm-dd. Retorna "aaaa-mm-dd" ou null se a data não existir.
export function parseDataParaIso(entrada: string): string | null {
  const texto = entrada.trim();
  let ano: number;
  let mes: number;
  let dia: number;

  const brasil = /^(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})$/.exec(texto);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);

  if (brasil) {
    dia = Number(brasil[1]);
    mes = Number(brasil[2]);
    ano = Number(brasil[3]);
    if (brasil[3].length === 2) ano += 2000;
  } else if (iso) {
    ano = Number(iso[1]);
    mes = Number(iso[2]);
    dia = Number(iso[3]);
  } else {
    return null;
  }

  // Confere se a data existe de fato (ex.: 31/02 não existe).
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) {
    return null;
  }

  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}
