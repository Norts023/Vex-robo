import { redirect } from "next/navigation";
import { excluirConta, sair } from "@/app/auth/actions";
import { FormularioAuth } from "@/components/formulario-auth";
import { NOME_APP } from "@/lib/config-app";
import { createClient } from "@/lib/supabase/server";

export default async function PaginaDashboard() {
  const supabase = await createClient();
  // Checagem extra além do proxy. Quem está logado só vê as próprias linhas por causa do RLS.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [perfil, lancamentos, dividas] = await Promise.all([
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
    supabase.from("transactions").select("id", { count: "exact", head: true }),
    supabase.from("debts").select("id", { count: "exact", head: true }),
  ]);

  const nome = perfil.data?.nome || "";

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="font-semibold tracking-tight text-emerald-700">{NOME_APP}</span>
          <form action={sair}>
            <button type="submit" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight">Olá{nome ? `, ${nome}` : ""}!</h1>
          <p className="mt-1 text-sm text-slate-600">
            Aqui fica o resumo das suas finanças. Importação de extratos, dívidas e análises com IA chegam nas
            próximas fases.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Indicador titulo="Lançamentos cadastrados" valor={lancamentos.count ?? 0} />
          <Indicador titulo="Dívidas cadastradas" valor={dividas.count ?? 0} />
        </section>

        <section className="rounded-2xl border border-red-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Excluir minha conta</h2>
          <p className="mt-1 text-sm text-slate-600">
            Remove sua conta e todos os dados cadastrados (lançamentos e dívidas). Essa ação não pode ser desfeita.
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
    </div>
  );
}

function Indicador({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-600">{titulo}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{valor}</p>
    </div>
  );
}
