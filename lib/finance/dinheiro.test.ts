import { describe, expect, it } from "vitest";
import { formatarReais, parseDataParaIso, parseValorParaCentavos } from "./dinheiro";
import { converterLinhas, separarNovos, sugerirMapeamento } from "./importacao";
import { detectarSeparador, parseCsv } from "./csv";

describe("parseValorParaCentavos", () => {
  it.each([
    ["1.234,56", 123456],
    ["1234.56", 123456],
    ["-89,90", -8990],
    ["R$ 12,00", 1200],
    ["(45,00)", -4500],
    ["1.234.567,89", 123456789],
    ["0,5", 50],
    ["100", 10000],
  ])("%s -> %i centavos", (texto, esperado) => {
    expect(parseValorParaCentavos(texto)).toBe(esperado);
  });

  it("retorna null para texto que não é valor", () => {
    expect(parseValorParaCentavos("abc")).toBeNull();
    expect(parseValorParaCentavos("")).toBeNull();
  });
});

describe("parseDataParaIso", () => {
  it("aceita dd/mm/aaaa, dd/mm/aa e aaaa-mm-dd", () => {
    expect(parseDataParaIso("05/03/2026")).toBe("2026-03-05");
    expect(parseDataParaIso("5/3/26")).toBe("2026-03-05");
    expect(parseDataParaIso("2026-03-05")).toBe("2026-03-05");
  });

  it("rejeita datas que não existem", () => {
    expect(parseDataParaIso("31/02/2026")).toBeNull();
    expect(parseDataParaIso("29/02/2025")).toBeNull();
    expect(parseDataParaIso("texto")).toBeNull();
  });

  it("aceita 29/02 em ano bissexto", () => {
    expect(parseDataParaIso("29/02/2028")).toBe("2028-02-29");
  });
});

describe("formatarReais", () => {
  it("formata em real brasileiro", () => {
    expect(formatarReais(123456)).toMatch(/1\.234,56/);
  });
});

describe("parseCsv", () => {
  it("detecta ponto e vírgula como separador", () => {
    expect(detectarSeparador("data;descricao;valor\n")).toBe(";");
    expect(detectarSeparador("data,descricao,valor\n")).toBe(",");
  });

  it("respeita aspas, aspas escapadas e quebras de linha dentro do campo", () => {
    const csv = 'data;descricao;valor\r\n01/01/2026;"PADARIA ""ABC"", filial";-10,00\r\n02/01/2026;"linha\nquebrada";-5,00\r\n';
    const linhas = parseCsv(csv);
    expect(linhas[1]).toEqual(["01/01/2026", 'PADARIA "ABC", filial', "-10,00"]);
    expect(linhas[2][1]).toBe("linha\nquebrada");
    expect(linhas).toHaveLength(3);
  });

  it("ignora BOM e linhas em branco", () => {
    const linhas = parseCsv("﻿data;valor\n\n01/01/2026;1,00\n");
    expect(linhas).toEqual([["data", "valor"], ["01/01/2026", "1,00"]]);
  });
});

describe("converterLinhas", () => {
  const mapa = { data: 0, descricao: 1, valor: 2 };

  it("usa o sinal para definir receita ou despesa (negativo = despesa)", () => {
    const { validos, invalidas } = converterLinhas(
      [
        ["01/03/2026", "IFOOD *PEDIDO", "-45,90"],
        ["02/03/2026", "SALARIO EMPRESA", "5.000,00"],
      ],
      mapa,
      "negativo-despesa",
    );
    expect(invalidas).toEqual([]);
    expect(validos[0]).toMatchObject({ tipo: "despesa", valorCentavos: 4590, categoria: "Alimentação", data: "2026-03-01" });
    expect(validos[1]).toMatchObject({ tipo: "receita", valorCentavos: 500000, categoria: "Salário" });
  });

  it("convenção invertida: positivo = despesa", () => {
    const { validos } = converterLinhas([["01/03/2026", "NETFLIX", "39,90"]], mapa, "positivo-despesa");
    expect(validos[0].tipo).toBe("despesa");
  });

  it("aponta linhas inválidas com o número da linha do arquivo", () => {
    const { validos, invalidas } = converterLinhas(
      [
        ["31/02/2026", "X", "1,00"],
        ["01/03/2026", "", "1,00"],
        ["01/03/2026", "Y", "zero"],
        ["01/03/2026", "Z", "0,00"],
      ],
      mapa,
      "negativo-despesa",
    );
    expect(validos).toEqual([]);
    expect(invalidas.map((i) => i.linha)).toEqual([2, 3, 4, 5]);
  });
});

describe("separarNovos", () => {
  const base = { data: "2026-03-01", descricao: "Padaria", valorCentavos: 1000, tipo: "despesa" };

  it("ignora o que já existe no banco, mas mantém repetições legítimas", () => {
    const candidatos = [base, base]; // 2 compras iguais no extrato
    const existentes = [base]; // 1 já gravada
    const { novos, duplicados } = separarNovos(candidatos, existentes);
    expect(novos).toHaveLength(1);
    expect(duplicados).toBe(1);
  });

  it("não ignora nada quando o banco está vazio", () => {
    const { novos, duplicados } = separarNovos([base, base], []);
    expect(novos).toHaveLength(2);
    expect(duplicados).toBe(0);
  });
});

describe("sugerirMapeamento", () => {
  it("reconhece colunas em português e em inglês", () => {
    expect(sugerirMapeamento(["Data", "Descrição", "Valor"])).toEqual({ data: 0, descricao: 1, valor: 2 });
    expect(sugerirMapeamento(["date", "title", "amount"])).toEqual({ data: 0, descricao: 1, valor: 2 });
  });

  it("retorna -1 para colunas não encontradas", () => {
    expect(sugerirMapeamento(["ID", "Obs"])).toEqual({ data: -1, descricao: -1, valor: -1 });
  });
});
