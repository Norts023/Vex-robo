"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirUsuario } from "@/lib/supabase/usuario";
import { TODAS_CATEGORIAS } from "@/lib/finance/categorias";
import { MAX_LINHAS_IMPORTACAO, separarNovos } from "@/lib/finance/importacao";

const lancamentoSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
  descricao: z.string().trim().min(1).max(200),
  valorCentavos: z.number().int().positive().max(999_999_999_999),
  tipo: z.enum(["receita", "despesa"]),
  categoria: z.enum(TODAS_CATEGORIAS),
});

const listaSchema = z.array(lancamentoSchema).min(1).max(MAX_LINHAS_IMPORTACAO);

export type ResultadoImportacao =
  | { ok: true; importados: number; duplicados: number }
  | { ok: false; erro: string };

// Recebe os lançamentos já convertidos pelo navegador, mas valida tudo de novo no servidor.
export async function importarLancamentos(entrada: unknown): Promise<ResultadoImportacao> {
  const validado = listaSchema.safeParse(entrada);
  if (!validado.success) {
    return { ok: false, erro: "Os dados do arquivo são inválidos. Confira o mapeamento e tente de novo." };
  }

  const { supabase, user } = await exigirUsuario();
  const lancamentos = validado.data;
  const datas = lancamentos.map((l) => l.data).sort();

  const { data: existentes, error: erroLeitura } = await supabase
    .from("transactions")
    .select("data, descricao, valor, tipo")
    .gte("data", datas[0])
    .lte("data", datas[datas.length - 1]);

  if (erroLeitura) {
    return { ok: false, erro: "Não foi possível verificar lançamentos já existentes. Tente novamente." };
  }

  const jaExistentes = (existentes ?? []).map((e) => ({
    data: String(e.data),
    descricao: String(e.descricao),
    valorCentavos: Math.round(Number(e.valor) * 100),
    tipo: String(e.tipo),
  }));

  const { novos, duplicados } = separarNovos(lancamentos, jaExistentes);

  if (novos.length > 0) {
    const { error } = await supabase.from("transactions").insert(
      novos.map((l) => ({
        user_id: user.id,
        data: l.data,
        descricao: l.descricao,
        valor: l.valorCentavos / 100,
        categoria: l.categoria,
        tipo: l.tipo,
      })),
    );
    if (error) {
      return { ok: false, erro: "Não foi possível salvar os lançamentos. Nenhum dado foi importado." };
    }
  }

  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
  return { ok: true, importados: novos.length, duplicados };
}
