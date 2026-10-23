import "server-only";
import { z } from "zod";

// Modelo usado para o diagnóstico. Para trocar, altere só esta constante.
const MODELO = "claude-haiku-5-5";
const URL_API = "https://api.anthropic.com/v1/messages";

export type Diagnostico = { diagnostico: string; dicas: string[] };

export class ErroIA extends Error {}

const respostaSchema = z.object({
  diagnostico: z.string().trim().min(1).max(1500),
  dicas: z.array(z.string().trim().min(1).max(400)).min(1).max(3),
});

const PROMPT_SISTEMA = `Você é um assistente de educação financeira e organização pessoal, em português do Brasil.
Receberá um resumo numérico das finanças de uma pessoa (sem extrato completo).
Responda com um diagnóstico curto e até 3 dicas práticas, em linguagem simples.
Regras:
- Não recomende investimentos, produtos financeiros, ativos ou corretoras.
- Não invente números: use apenas os valores recebidos.
- Responda somente com JSON válido, neste formato: {"diagnostico": "...", "dicas": ["...", "..."]}`;

// Chama a API da Anthropic no servidor. A chave nunca chega ao navegador.
export async function gerarDiagnosticoIA(resumo: Record<string, unknown>): Promise<Diagnostico> {
  const chave = process.env.ANTHROPIC_API_KEY;
  if (!chave) {
    throw new ErroIA("A análise com IA não está configurada no servidor.");
  }

  let resposta: Response;
  try {
    resposta = await fetch(URL_API, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": chave,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 700,
        system: PROMPT_SISTEMA,
        messages: [
          {
            role: "user",
            content: `Resumo financeiro:\n${JSON.stringify(resumo, null, 2)}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new ErroIA("Não foi possível falar com o serviço de IA. Tente novamente em instantes.");
  }

  if (!resposta.ok) {
    throw new ErroIA("O serviço de IA recusou a solicitação. Tente novamente mais tarde.");
  }

  const corpo = (await resposta.json()) as { content?: { type: string; text?: string }[] };
  const texto = (corpo.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");

  const inicio = texto.indexOf("{");
  const fim = texto.lastIndexOf("}");
  if (inicio < 0 || fim < inicio) {
    throw new ErroIA("A IA respondeu em formato inesperado. Tente novamente.");
  }

  let json: unknown;
  try {
    json = JSON.parse(texto.slice(inicio, fim + 1));
  } catch {
    throw new ErroIA("A IA respondeu em formato inesperado. Tente novamente.");
  }

  const validado = respostaSchema.safeParse(json);
  if (!validado.success) {
    throw new ErroIA("A IA respondeu em formato inesperado. Tente novamente.");
  }
  return validado.data;
}
