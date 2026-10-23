import { entrar } from "@/app/auth/actions";
import { Alerta } from "@/components/alerta";
import { CartaoAuth } from "@/components/cartao-auth";
import { FormularioAuth } from "@/components/formulario-auth";

type Props = { searchParams: Promise<{ erro?: string; conta?: string }> };

export default async function PaginaLogin({ searchParams }: Props) {
  const { erro, conta } = await searchParams;

  return (
    <CartaoAuth
      titulo="Entrar"
      rodape={{ texto: "Ainda não tem conta?", href: "/cadastro", rotulo: "Criar conta" }}
    >
      {conta === "excluida" && (
        <div className="mb-4">
          <Alerta tipo="sucesso">Sua conta e seus dados foram excluídos.</Alerta>
        </div>
      )}
      {erro === "link-invalido" && (
        <div className="mb-4">
          <Alerta tipo="erro">Este link é inválido ou expirou. Tente novamente.</Alerta>
        </div>
      )}
      <FormularioAuth
        acao={entrar}
        textoBotao="Entrar"
        campos={[
          { name: "email", label: "E-mail", type: "email", autoComplete: "email" },
          { name: "senha", label: "Senha", type: "password", autoComplete: "current-password" },
        ]}
      />
      <p className="mt-4 text-center text-sm">
        <a href="/recuperar-senha" className="text-emerald-700 hover:underline">
          Esqueci minha senha
        </a>
      </p>
    </CartaoAuth>
  );
}
