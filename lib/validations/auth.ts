import { z } from "zod";

// Regras de validação dos formulários de autenticação.
// As mesmas regras valem no servidor, pois o navegador pode ser contornado.

const email = z
  .string({ error: "Informe seu e-mail." })
  .trim()
  .min(1, "Informe seu e-mail.")
  .max(254, "E-mail muito longo.")
  .pipe(z.email("Informe um e-mail válido."));

const senhaNova = z
  .string({ error: "Informe uma senha." })
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(72, "A senha deve ter no máximo 72 caracteres.")
  .regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra.")
  .regex(/\d/, "A senha deve conter pelo menos um número.");

const confirmacaoSenha = z.string({ error: "Confirme a senha." });

function senhasIguais(d: { senha: string; confirmarSenha: string }) {
  return d.senha === d.confirmarSenha;
}

const erroSenhasDiferentes = {
  message: "As senhas não conferem.",
  path: ["confirmarSenha"],
};

export const cadastroSchema = z
  .object({
    nome: z
      .string({ error: "Informe seu nome." })
      .trim()
      .min(2, "Informe seu nome completo.")
      .max(120, "Nome muito longo."),
    email,
    senha: senhaNova,
    confirmarSenha: confirmacaoSenha,
  })
  .refine(senhasIguais, erroSenhasDiferentes);

export const loginSchema = z.object({
  email,
  senha: z.string({ error: "Informe sua senha." }).min(1, "Informe sua senha."),
});

export const recuperarSenhaSchema = z.object({ email });

export const redefinirSenhaSchema = z
  .object({
    senha: senhaNova,
    confirmarSenha: confirmacaoSenha,
  })
  .refine(senhasIguais, erroSenhasDiferentes);

export const excluirContaSchema = z.object({
  confirmacao: z.literal("EXCLUIR", {
    error: 'Digite EXCLUIR (em maiúsculas) para confirmar.',
  }),
});
