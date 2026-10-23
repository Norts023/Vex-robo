import { describe, expect, it } from "vitest";
import { categorizar, normalizarTexto } from "./categorias";

describe("normalizarTexto", () => {
  it("remove acentos, caixa e espaços extras", () => {
    expect(normalizarTexto("  Salário   Mensal ")).toBe("salario mensal");
  });
});

describe("categorizar: despesas", () => {
  it.each([
    ["IFOOD *RESTAURANTE 1234", "Alimentação"],
    ["Pag*Padaria do Bairro", "Alimentação"],
    ["Uber *Trip", "Transporte"],
    ["UBER EATS", "Alimentação"], // "uber eats" vence a regra genérica de "uber"
    ["NETFLIX.COM", "Assinaturas"],
    ["AMAZON PRIME BR", "Assinaturas"], // antes de "amazon" em Compras
    ["MERCADO LIVRE", "Compras"], // antes de "mercado" em Alimentação
    ["SUPERMERCADO EXTRA", "Alimentação"],
    ["ENEL SP", "Contas e serviços"],
    ["POSTO SHELL", "Transporte"],
    ["DROGASIL 0231", "Saúde"],
    ["ALUGUEL OUTUBRO", "Moradia"],
    ["IOF COMPRA EXTERIOR", "Impostos e taxas"],
    ["PIX ENVIADO JOAO", "Transferências"],
  ])("%s -> %s", (descricao, esperado) => {
    expect(categorizar(descricao, "despesa")).toBe(esperado);
  });

  it("cai em 'Outros' quando nenhuma palavra combina", () => {
    expect(categorizar("LOJA XYZ QWERTY", "despesa")).toBe("Outros");
  });

  it("não casa palavra dentro de outra palavra (gasolina não é 'gas')", () => {
    expect(categorizar("GASOLINA AUTO POSTO", "despesa")).toBe("Transporte");
    expect(categorizar("BARBEARIA CENTRAL", "despesa")).toBe("Outros");
  });

  it("reconhece 'c&a' como loja", () => {
    expect(categorizar("C&A MODAS", "despesa")).toBe("Compras");
  });
});

describe("categorizar: receitas", () => {
  it("identifica salário", () => {
    expect(categorizar("Salario Empresa XYZ", "receita")).toBe("Salário");
    expect(categorizar("Salário", "receita")).toBe("Salário");
  });

  it("usa 'Outras receitas' como padrão", () => {
    expect(categorizar("PIX RECEBIDO MARIA", "receita")).toBe("Outras receitas");
  });
});
