"use server";

import { z } from "zod";
import { gerarDiagnosticoIA, type Diagnostico, ErroIA } from "@/lib/ai/diagnostico";
import { type Lancamento, ultimosMeses } from "@/lib/finance/resumo";
import { montarResumoParaIA } from "@/lib/finance/resumo-ia";
import type { Divida } from "@/lib/finance/divida";
import { exigirUsuario } from "@/lib/supabase/usuario";

export type EstadoDiagnostico =
  | { ok: true; resultado: Diagnostico }
  | { ok: false; erro: string }
  | null;

const mesSchema = z.string().regex(/^\d{4}-\d{2}$/);

// Gera o diagnóstico do mês escolhido. Só números seguem para a IA.
export async function gerarDiagnostico(_estado: EstadoDiagnostico, formData: FormData): Promise<EstadoDiagnostico> {
  const mes = mesSchema.safeParse(String(formData.get("mes") ?? ""));
  if (!mes.success) return { ok: false, erro: "Mês inválido." };

  const { supabase } = await exigirUsuario();
  const meses = ultimosMeses(mes.data, 3);

  const [transacoes, dividas] = await Promise.all([
    supabase
      .from("transactions")
      .select("data, valor, tipo, categoria")
      .gte("data", `${meses[0]}-01`)
      .lte("data", `${mes.data}-31`),
    supabase.from("debts").select("id, nome, saldo, taxa_juros_mensal, parcela_minima"),
  ]);

  if (transacoes.error || dividas.error) {
    return { ok: false, erro: "Não foi possível carregar seus dados. Tente novamente." };
  }

  const lancamentos: Lancamento[] = (transacoes.data ?? []).map((t) => ({
    data: String(t.data),
    valorCentavos: Math.round(Number(t.valor) * 100),
    tipo: t.tipo as Lancamento["tipo"],
    categoria: String(t.categoria),
  }));

  const listaDividas: Divida[] = (dividas.data ?? []).map((d) => ({
    id: String(d.id),
    nome: String(d.nome),
    saldoCentavos: Math.round(Number(d.saldo) * 100),
    taxaJurosMensal: Number(d.taxa_juros_mensal),
    parcelaMinimaCentavos: Math.round(Number(d.parcela_minima) * 100),
  }));

  const orcamentoCentavos = parseOrcamento(String(formData.get("orcamentoDividas") ?? ""));
  const resumo = montarResumoParaIA({
    mes: mes.data,
    lancamentos,
    dividas: listaDividas,
    orcamentoDividasCentavos: orcamentoCentavos ?? undefined,
  });

  try {
    const resultado = await gerarDiagnosticoIA(resumo);
    return { ok: true, resultado };
  } catch (erro) {
    return { ok: false, erro: erro instanceof ErroIA ? erro.message : "Erro inesperado ao gerar o diagnóstico." };
  }
}

function parseOrcamento(texto: string): number | null {
  if (!texto.trim()) return null;
  const valor = Number(texto.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(valor) && valor > 0 ? Math.round(valor * 100) : null;
}
