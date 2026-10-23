import { excluirConta } from "@/app/auth/actions";
import { FormularioAuth } from "@/components/formulario-auth";

export default function PaginaConta() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Conta e privacidade</h1>
        <p className="mt-1 text-sm text-slate-600">
          Seus dados são usados só para organizar suas finanças. Você pode excluí-los quando quiser.
        </p>
      </div>

      <section className="rounded-2xl border border-red-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Excluir minha conta</h2>
        <p className="mt-1 text-sm text-slate-600">
          Remove sua conta, seus lançamentos, dívidas e perfil. Essa ação não pode ser desfeita.
        </p>
        <div className="mt-4 max-w-sm">
          <FormularioAuth
            acao={excluirConta}
            variante="perigo"
            textoBotao="Excluir minha conta e meus dados"
            campos={[{ name: "confirmacao", label: "Digite EXCLUIR para confirmar", placeholder: "EXCLUIR" }]}
          />
        </div>
      </section>
    </main>
  );
}
