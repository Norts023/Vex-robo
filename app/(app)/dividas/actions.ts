"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { EstadoFormulario } from "@/app/auth/actions";
import { parseValorParaCentavos } from "@/lib/finance/dinheiro";
import { exigirUsuario } from "@/lib/supabase/usuario";

// Aceita "2,5", "2.5" ou "2,50". Retorna null se não for um número entre 0 e 100.
function parseTaxa(texto: string): number | null {
  const normalizado = texto.trim().replace("%", "").replace(",", ".");
  if (!/^\d{1,3}(\.\d{1,4})?$/.test(normalizado)) return null;
  const taxa = Number(normalizado);
  return taxa >= 0 && taxa <= 100 ? taxa : null;
}

const nomeSchema = z.string().trim().min(1, "Informe o nome da dívida.").max(120, "Nome muito longo.");

export async function criarDivida(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const entrada = {
    nome: String(formData.get("nome") ?? ""),
    saldo: String(formData.get("saldo") ?? ""),
    taxa: String(formData.get("taxa") ?? ""),
    parcela: String(formData.get("parcela") ?? ""),
  };

  const erros: Record<string, string> = {};

  const nome = nomeSchema.safeParse(entrada.nome);
  if (!nome.success) erros.nome = nome.error.issues[0].message;

  const saldo = parseValorParaCentavos(entrada.saldo);
  if (saldo === null || saldo <= 0) erros.saldo = "Informe um saldo maior que zero, como 1.500,00.";

  const taxa = parseTaxa(entrada.taxa);
  if (taxa === null) erros.taxa = "Informe a taxa mensal em %, entre 0 e 100. Exemplo: 12,5";

  const parcela = parseValorParaCentavos(entrada.parcela);
  if (parcela === null || parcela < 0) erros.parcela = "Informe a parcela mínima, como 250,00 (use 0 se não houver).";

  if (Object.keys(erros).length > 0) {
    return {
      erro: "Corrija os campos destacados.",
      campos: erros,
      valores: { nome: entrada.nome, saldo: entrada.saldo, taxa: entrada.taxa, parcela: entrada.parcela },
      ciclo: Date.now(),
    };
  }

  const { supabase, user } = await exigirUsuario();
  const { error } = await supabase.from("debts").insert({
    user_id: user.id,
    nome: nome.success ? nome.data : entrada.nome,
    saldo: (saldo as number) / 100,
    taxa_juros_mensal: taxa as number,
    parcela_minima: (parcela as number) / 100,
  });

  if (error) {
    return { erro: "Não foi possível salvar a dívida. Tente novamente.", ciclo: Date.now() };
  }

  revalidatePath("/dividas");
  revalidatePath("/dashboard");
  return { sucesso: "Dívida cadastrada." };
}

export async function excluirDivida(id: string): Promise<void> {
  if (!z.uuid().safeParse(id).success) return;
  const { supabase } = await exigirUsuario();
  await supabase.from("debts").delete().eq("id", id);
  revalidatePath("/dividas");
  revalidatePath("/dashboard");
}
