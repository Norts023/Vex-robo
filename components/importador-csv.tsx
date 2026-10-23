"use client";

import { type ChangeEvent, useMemo, useState, useTransition } from "react";
import { importarLancamentos, type ResultadoImportacao } from "@/app/(app)/importar/actions";
import { parseCsv } from "@/lib/finance/csv";
import {
  converterLinhas,
  type ConvencaoSinal,
  MAX_LINHAS_IMPORTACAO,
  type Mapeamento,
  sugerirMapeamento,
} from "@/lib/finance/importacao";
import { formatarReais } from "@/lib/finance/dinheiro";
import { Alerta } from "./alerta";

const TAMANHO_MAXIMO = 2 * 1024 * 1024;
const LINHAS_PREVIA = 8;

export function ImportadorCsv() {
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<string[][]>([]);
  const [mapeamento, setMapeamento] = useState<Mapeamento>({ data: -1, descricao: -1, valor: -1 });
  const [convencao, setConvencao] = useState<ConvencaoSinal>("negativo-despesa");
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const [enviando, iniciarEnvio] = useTransition();

  const cabecalho = linhas[0] ?? [];
  const dados = linhas.slice(1);
  const mapeamentoCompleto = mapeamento.data >= 0 && mapeamento.descricao >= 0 && mapeamento.valor >= 0;

  const conversao = useMemo(
    () => (mapeamentoCompleto ? converterLinhas(dados, mapeamento, convencao) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [linhas, mapeamento, convencao],
  );

  async function lerArquivo(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    setResultado(null);
    setErro(null);
    if (!arquivo) return;

    if (!/\.(csv|txt)$/i.test(arquivo.name)) {
      setErro("Envie um arquivo .csv exportado do seu banco.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro("O arquivo passa de 2 MB. Exporte um período menor.");
      return;
    }

    const lidas = parseCsv(await arquivo.text());
    if (lidas.length < 2) {
      setErro("O arquivo precisa de uma linha de cabeçalho e pelo menos um lançamento.");
      return;
    }
    if (lidas.length - 1 > MAX_LINHAS_IMPORTACAO) {
      setErro(`O arquivo tem mais de ${MAX_LINHAS_IMPORTACAO} linhas. Exporte um período menor.`);
      return;
    }

    setNomeArquivo(arquivo.name);
    setLinhas(lidas);
    setMapeamento(sugerirMapeamento(lidas[0]));
  }

  function enviar() {
    if (!conversao || conversao.validos.length === 0) return;
    iniciarEnvio(async () => {
      const r = await importarLancamentos(conversao.validos);
      setResultado(r);
      if (r.ok) {
        setLinhas([]);
        setNomeArquivo(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700" htmlFor="arquivo">
          Arquivo CSV do extrato
        </label>
        <input
          id="arquivo"
          type="file"
          accept=".csv,.txt,text/csv"
          onChange={lerArquivo}
          className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
        />
        <p className="mt-2 text-xs text-slate-500">
          Máximo de 2 MB e {MAX_LINHAS_IMPORTACAO} lançamentos. A primeira linha deve ser o cabeçalho.
        </p>
        {nomeArquivo && <p className="mt-2 text-sm text-slate-600">Arquivo: {nomeArquivo}</p>}
        {erro && (
          <div className="mt-4">
            <Alerta tipo="erro">{erro}</Alerta>
          </div>
        )}
      </section>

      {resultado && (
        <Alerta tipo={resultado.ok ? "sucesso" : "erro"}>
          {resultado.ok
            ? `${resultado.importados} lançamento(s) importado(s). ${resultado.duplicados} já existiam e foram ignorados.`
            : resultado.erro}
        </Alerta>
      )}

      {linhas.length > 0 && (
        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">Mapeie as colunas</h2>
            <p className="mt-1 text-sm text-slate-600">Confira se cada campo aponta para a coluna certa.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <SeletorColuna rotulo="Data" cabecalho={cabecalho} valor={mapeamento.data} onChange={(v) => setMapeamento({ ...mapeamento, data: v })} />
            <SeletorColuna rotulo="Descrição" cabecalho={cabecalho} valor={mapeamento.descricao} onChange={(v) => setMapeamento({ ...mapeamento, descricao: v })} />
            <SeletorColuna rotulo="Valor" cabecalho={cabecalho} valor={mapeamento.valor} onChange={(v) => setMapeamento({ ...mapeamento, valor: v })} />
          </div>

          <fieldset className="text-sm">
            <legend className="font-medium text-slate-700">Como o banco mostra as despesas?</legend>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
              <label className="flex items-center gap-2">
                <input type="radio" name="convencao" checked={convencao === "negativo-despesa"} onChange={() => setConvencao("negativo-despesa")} />
                Valores negativos são despesas (ex.: -45,90)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="convencao" checked={convencao === "positivo-despesa"} onChange={() => setConvencao("positivo-despesa")} />
                Valores positivos são despesas
              </label>
            </div>
          </fieldset>

          {!mapeamentoCompleto && (
            <Alerta tipo="erro">Selecione a coluna de data, descrição e valor para ver a prévia.</Alerta>
          )}

          {conversao && (
            <>
              <div>
                <h3 className="font-medium">Prévia</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {conversao.validos.length} válido(s) · {conversao.invalidas.length} com erro (serão ignorados)
                </p>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">Data</th>
                      <th className="px-3 py-2 font-medium">Descrição</th>
                      <th className="px-3 py-2 font-medium">Tipo</th>
                      <th className="px-3 py-2 font-medium">Categoria sugerida</th>
                      <th className="px-3 py-2 text-right font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {conversao.validos.slice(0, LINHAS_PREVIA).map((l, i) => (
                      <tr key={i}>
                        <td className="whitespace-nowrap px-3 py-2 tabular-nums">{l.data.split("-").reverse().join("/")}</td>
                        <td className="px-3 py-2">{l.descricao}</td>
                        <td className="px-3 py-2">{l.tipo === "despesa" ? "Despesa" : "Receita"}</td>
                        <td className="px-3 py-2">{l.categoria}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{formatarReais(l.valorCentavos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {conversao.invalidas.length > 0 && (
                <details className="text-sm text-slate-600">
                  <summary className="cursor-pointer">Ver linhas com erro</summary>
                  <ul className="mt-2 list-disc pl-5">
                    {conversao.invalidas.slice(0, 50).map((i) => (
                      <li key={i.linha}>
                        Linha {i.linha}: {i.motivo}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <button
                type="button"
                onClick={enviar}
                disabled={enviando || conversao.validos.length === 0}
                className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando ? "Importando..." : `Importar ${conversao.validos.length} lançamento(s)`}
              </button>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function SeletorColuna({
  rotulo,
  cabecalho,
  valor,
  onChange,
}: {
  rotulo: string;
  cabecalho: string[];
  valor: number;
  onChange: (indice: number) => void;
}) {
  return (
    <label className="text-sm">
      <span className="block font-medium text-slate-700">{rotulo}</span>
      <select
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2"
      >
        <option value={-1}>— escolher coluna —</option>
        {cabecalho.map((nome, i) => (
          <option key={i} value={i}>
            {nome || `Coluna ${i + 1}`}
          </option>
        ))}
      </select>
    </label>
  );
}
