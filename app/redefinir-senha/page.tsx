import { redefinirSenha } from "@/app/auth/actions";
import { CartaoAuth } from "@/components/cartao-auth";
import { FormularioAuth } from "@/components/formulario-auth";

export default function PaginaRedefinirSenha() {
  return (
    <CartaoAuth titulo="Nova senha" descricao="Escolha uma nova senha para a sua conta.">
      <FormularioAuth
        acao={redefinirSenha}
        textoBotao="Salvar nova senha"
        campos={[
          { name: "senha", label: "Nova senha", type: "password", autoComplete: "new-password" },
          { name: "confirmarSenha", label: "Confirmar nova senha", type: "password", autoComplete: "new-password" },
        ]}
      />
    </CartaoAuth>
  );
}
