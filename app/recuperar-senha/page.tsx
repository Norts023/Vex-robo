import { solicitarRecuperacao } from "@/app/auth/actions";
import { CartaoAuth } from "@/components/cartao-auth";
import { FormularioAuth } from "@/components/formulario-auth";

export default function PaginaRecuperarSenha() {
  return (
    <CartaoAuth
      titulo="Recuperar senha"
      descricao="Informe o e-mail da sua conta. Enviaremos um link para criar uma nova senha."
      rodape={{ texto: "Lembrou a senha?", href: "/login", rotulo: "Voltar ao login" }}
    >
      <FormularioAuth
        acao={solicitarRecuperacao}
        textoBotao="Enviar link"
        campos={[{ name: "email", label: "E-mail", type: "email", autoComplete: "email" }]}
      />
    </CartaoAuth>
  );
}
