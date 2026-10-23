import { ImportadorCsv } from "@/components/importador-csv";

export default function PaginaImportar() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Importar extrato</h1>
        <p className="mt-1 text-sm text-slate-600">
          Envie um arquivo CSV do seu banco. Não pedimos senha de banco nem de internet banking.
        </p>
      </div>
      <ImportadorCsv />
    </main>
  );
}
