"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  cadastroSchema,
  excluirContaSchema,
  loginSchema,
  recuperarSenhaSchema,
  redefinirSenhaSchema,
} from "@/lib/validations/auth";

// Estado devolvido aos formulários. Senhas nunca voltam ao navegador.
export type EstadoFormulario = {
  erro?: string;
  sucesso?: string;
  campos?: Record<string, string>;
  valores?: Record<string, string>;
  // Muda a cada resposta com erro, para o formulário recriar os campos com os valores preenchidos.
  ciclo?: number;
};

function erro(mensagem: string, extra: Omit<EstadoFormulario, "erro" | "ciclo"> = {}): EstadoFormulario {
  return { erro: mensagem, ciclo: Date.now(), ...extra };
}

function errosDosCampos(error: ZodError): Record<string, string> {
  const campos: Record<string, string> = {};
  for (const issue of error.issues) {
    const chave = String(issue.path[0] ?? "formulario");
    campos[chave] ??= issue.message;
  }
  return campos;
}

// Converte as mensagens do Supabase em português claro.
function traduzirErro(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";
  if (m.includes("user already registered")) return "Já existe uma conta com este e-mail.";
  if (m.includes("new password should be different")) return "A nova senha deve ser diferente da anterior.";
  if (m.includes("should be at least")) return "A senha é muito curta.";
  if (m.includes("for security purposes") || m.includes("rate limit")) {
    return "Muitas tentativas. Aguarde alguns instantes e tente de novo.";
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}

// Endereço público do app, usado nos links enviados por e-mail.
async function urlDoSite(): Promise<string> {
  const configurada = process.env.NEXT_PUBLIC_SITE_URL;
  if (configurada) return configurada.replace(/\/$/, "");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

function lerCampos(formData: FormData, chaves: string[]): Record<string, string> {
  return Object.fromEntries(chaves.map((c) => [c, String(formData.get(c) ?? "")]));
}

export async function cadastrar(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const entrada = lerCampos(formData, ["nome", "email", "senha", "confirmarSenha"]);
  const resultado = cadastroSchema.safeParse(entrada);
  if (!resultado.success) {
    return erro("Corrija os campos destacados.", {
      campos: errosDosCampos(resultado.error),
      valores: { nome: entrada.nome, email: entrada.email },
    });
  }

  const { nome, email, senha } = resultado.data;
  const supabase = await createClient();
  const site = await urlDoSite();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome },
      emailRedirectTo: `${site}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return erro(traduzirErro(error.message), { valores: { nome, email } });
  }

  // Sem confirmação de e-mail, o Supabase já cria a sessão.
  if (data.session) redirect("/dashboard");

  return { sucesso: "Enviamos um link de confirmação para o seu e-mail. Confirme para entrar." };
}

export async function entrar(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const entrada = lerCampos(formData, ["email", "senha"]);
  const resultado = loginSchema.safeParse(entrada);
  if (!resultado.success) {
    return erro("Corrija os campos destacados.", {
      campos: errosDosCampos(resultado.error),
      valores: { email: entrada.email },
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: resultado.data.email,
    password: resultado.data.senha,
  });

  if (error) {
    return erro(traduzirErro(error.message), { valores: { email: entrada.email } });
  }

  redirect("/dashboard");
}

export async function solicitarRecuperacao(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const entrada = lerCampos(formData, ["email"]);
  const resultado = recuperarSenhaSchema.safeParse(entrada);
  if (!resultado.success) {
    return erro("Corrija os campos destacados.", { campos: errosDosCampos(resultado.error) });
  }

  const supabase = await createClient();
  const site = await urlDoSite();
  const { error } = await supabase.auth.resetPasswordForEmail(resultado.data.email, {
    redirectTo: `${site}/auth/callback?next=/redefinir-senha`,
  });

  if (error) return erro(traduzirErro(error.message), { valores: { email: entrada.email } });

  // Mensagem neutra: não revela se o e-mail está cadastrado.
  return {
    sucesso: "Se este e-mail estiver cadastrado, você receberá um link para criar uma nova senha.",
  };
}

export async function redefinirSenha(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const entrada = lerCampos(formData, ["senha", "confirmarSenha"]);
  const resultado = redefinirSenhaSchema.safeParse(entrada);
  if (!resultado.success) {
    return erro("Corrija os campos destacados.", { campos: errosDosCampos(resultado.error) });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return erro("Este link expirou. Solicite uma nova recuperação de senha.");
  }

  const { error } = await supabase.auth.updateUser({ password: resultado.data.senha });
  if (error) return erro(traduzirErro(error.message));

  redirect("/dashboard");
}

export async function sair(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function excluirConta(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const entrada = lerCampos(formData, ["confirmacao"]);
  const resultado = excluirContaSchema.safeParse(entrada);
  if (!resultado.success) {
    return erro(resultado.error.issues[0]?.message ?? "Confirmação inválida.");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("excluir_minha_conta");
  if (error) return erro("Não foi possível excluir a conta. Tente novamente.");

  await supabase.auth.signOut();
  redirect("/login?conta=excluida");
}
