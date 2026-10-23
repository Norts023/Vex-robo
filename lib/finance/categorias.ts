// Categorização por palavras-chave. A primeira regra que combinar vence,
// por isso a ordem importa (ex.: "amazon prime" é Assinaturas, não Compras).

export const CATEGORIAS_DESPESA = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Contas e serviços",
  "Saúde",
  "Assinaturas",
  "Lazer",
  "Compras",
  "Educação",
  "Impostos e taxas",
  "Transferências",
  "Outros",
] as const;

export const CATEGORIAS_RECEITA = ["Salário", "Outras receitas"] as const;

export const TODAS_CATEGORIAS = [...CATEGORIAS_DESPESA, ...CATEGORIAS_RECEITA] as const;

export type Categoria = (typeof TODAS_CATEGORIAS)[number];
export type TipoLancamento = "receita" | "despesa";

type Regra = { categoria: Categoria; palavras: string[] };

const REGRAS_DESPESA: Regra[] = [
  { categoria: "Assinaturas", palavras: ["netflix", "spotify", "amazon prime", "prime video", "disney", "youtube premium", "deezer", "google one", "icloud", "assinatura"] },
  { categoria: "Compras", palavras: ["mercado livre", "mercadolivre", "shopee", "shein", "amazon", "aliexpress", "magalu", "magazine luiza", "americanas", "casas bahia", "renner", "riachuelo", "c&a", "zara"] },
  { categoria: "Alimentação", palavras: ["ifood", "rappi", "uber eats", "restaurante", "lanchonete", "padaria", "supermercado", "mercado", "hortifruti", "acougue", "burger king", "mcdonalds", "starbucks", "atacadao", "carrefour", "pao de acucar", "assai"] },
  { categoria: "Transporte", palavras: ["uber", "99app", "99 pop", "cabify", "indriver", "posto", "combustivel", "gasolina", "etanol", "estacionamento", "pedagio", "bilhete unico", "sem parar", "metro", "cptm", "onibus", "taxi"] },
  { categoria: "Moradia", palavras: ["aluguel", "condominio", "iptu", "imobiliaria"] },
  { categoria: "Contas e serviços", palavras: ["energia", "enel", "cpfl", "light", "sabesp", "saneamento", "agua", "gas", "comgas", "internet", "vivo", "claro", "tim", "oi", "telefone", "celular", "sky"] },
  { categoria: "Saúde", palavras: ["farmacia", "drogaria", "drogasil", "droga raia", "pacheco", "hospital", "clinica", "laboratorio", "dentista", "unimed", "plano de saude", "consulta", "exame"] },
  { categoria: "Educação", palavras: ["escola", "faculdade", "universidade", "curso", "udemy", "alura", "mensalidade", "colegio"] },
  { categoria: "Lazer", palavras: ["cinema", "ingresso", "steam", "playstation", "xbox", "bar", "show", "viagem", "hotel", "airbnb", "decolar", "booking"] },
  { categoria: "Impostos e taxas", palavras: ["imposto", "tarifa", "iof", "anuidade", "taxa", "ipva", "multa", "das", "darf"] },
  { categoria: "Transferências", palavras: ["transferencia", "ted", "doc", "pix enviado"] },
];

const REGRAS_RECEITA: Regra[] = [
  { categoria: "Salário", palavras: ["salario", "folha de pagamento", "holerite", "pro labore", "13o"] },
];

export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Transforma as palavras em expressões que casam com palavras inteiras.
// Não usa \b porque ele não funciona bem com "&" (como em "c&a").
function compilar(regras: Regra[]) {
  return regras.map((regra) => ({
    categoria: regra.categoria,
    padroes: regra.palavras.map(
      (p) => new RegExp(`(^|[^a-z0-9])${escaparRegex(normalizarTexto(p))}(?=$|[^a-z0-9])`),
    ),
  }));
}

const REGRAS_COMPILADAS = {
  despesa: compilar(REGRAS_DESPESA),
  receita: compilar(REGRAS_RECEITA),
};

export function categorizar(descricao: string, tipo: TipoLancamento): Categoria {
  const texto = normalizarTexto(descricao);
  const regras = REGRAS_COMPILADAS[tipo];

  for (const regra of regras) {
    if (regra.padroes.some((padrao) => padrao.test(texto))) return regra.categoria;
  }

  return tipo === "receita" ? "Outras receitas" : "Outros";
}
