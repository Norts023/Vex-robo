import { cadastrar } from "@/app/auth/actions";
import { CartaoAuth } from "@/components/cartao-auth";
import { FormularioAuth } from "@/components/formulario-auth";

export default function PaginaCadastro() {
  return (
    <CartaoAuth
      titulo="Criar conta"
      descricao="Você ganha 7 dias de teste gratuito. Não é preciso cartão de crédito."
      rodape={{ texto: "Já tem conta?", href: "/login", rotulo: "Entrar" }}
    >
      <FormularioAuth
        acao={cadastrar}
        textoBotao="Criar conta"
        campos={[
          { name: "nome", label: "Nome", autoComplete: "name" },
          { name: "email", label: "E-mail", type: "email", autoComplete: "email" },
          {
            name: "senha",
            label: "Senha",
            type: "password",
            autoComplete: "new-password",
            placeholder: "Mínimo 8 caracteres, com letras e números",
          },
          { name: "confirmarSenha", label: "Confirmar senha", type: "password", autoComplete: "new-password" },
        ]}
      />
    </CartaoAuth>
  );
}
