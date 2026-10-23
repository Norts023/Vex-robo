"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CATEGORIAS_DESPESA, CATEGORIAS_RECEITA, TODAS_CATEGORIAS } from "@/lib/finance/categorias";
import { exigirUsuario } from "@/lib/supabase/usuario";

const entradaSchema = z.object({
  id: z.uuid("Lançamento inválido."),
  categoria: z.enum(TODAS_CATEGORIAS, { error: "Categoria inválida." }),
});

export type ResultadoCategoria = { ok: true } | { ok: false; erro: string };

// Corrige a categoria de um lançamento. O RLS garante que só o dono consegue alterar.
export async function atualizarCategoria(id: string, categoria: string): Promise<ResultadoCategoria> {
  const validado = entradaSchema.safeParse({ id, categoria });
  if (!validado.success) return { ok: false, erro: validado.error.issues[0].message };

  const { supabase } = await exigirUsuario();

  const { data: lancamento, error: erroLeitura } = await supabase
    .from("transactions")
    .select("tipo")
    .eq("id", validado.data.id)
    .maybeSingle();

  if (erroLeitura || !lancamento) return { ok: false, erro: "Lançamento não encontrado." };

  // Receita não pode ficar em categoria de despesa, e vice-versa.
  const permitidas: readonly string[] = lancamento.tipo === "receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
  if (!permitidas.includes(validado.data.categoria)) {
    return { ok: false, erro: "Essa categoria não serve para este tipo de lançamento." };
  }

  const { error } = await supabase
    .from("transactions")
    .update({ categoria: validado.data.categoria })
    .eq("id", validado.data.id);

  if (error) return { ok: false, erro: "Não foi possível salvar a categoria. Tente novamente." };

  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
  return { ok: true };
}
