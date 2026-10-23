import { describe, expect, it } from "vitest";
import { montarResumoParaIA } from "./resumo-ia";

describe("montarResumoParaIA", () => {
  const lancamentos = [
    { data: "2026-10-03", valorCentavos: 50000, tipo: "receita" as const, categoria: "Salário" },
    { data: "2026-10-05", valorCentavos: 12000, tipo: "despesa" as const, categoria: "Alimentação" },
    { data: "2026-10-09", valorCentavos: 3000, tipo: "despesa" as const, categoria: "Transporte" },
  ];

  it("não inclui descrições nem nomes de dívidas, só números e categorias", () => {
    const texto = JSON.stringify(
      montarResumoParaIA({
        mes: "2026-10",
        lancamentos,
        dividas: [{ id: "1", nome: "Cartão Nubank Secreto", saldoCentavos: 100000, taxaJurosMensal: 10, parcelaMinimaCentavos: 5000 }],
        orcamentoDividasCentavos: 20000,
      }),
    );
    expect(texto).not.toContain("Nubank");
    expect(texto).toContain("R$");
  });

  it("calcula receitas, despesas e saldo do mês", () => {
    const r = montarResumoParaIA({ mes: "2026-10", lancamentos, dividas: [] });
    expect(r).toMatchObject({ receitasDoMes: expect.stringContaining("500,00"), despesasDoMes: expect.stringContaining("150,00") });
    expect(r).not.toHaveProperty("planoDeQuitacao");
  });

  it("inclui o plano de quitação quando há dívidas e orçamento", () => {
    const r = montarResumoParaIA({
      mes: "2026-10",
      lancamentos,
      dividas: [{ id: "1", nome: "X", saldoCentavos: 100000, taxaJurosMensal: 0, parcelaMinimaCentavos: 5000 }],
      orcamentoDividasCentavos: 50000,
    });
    expect(r).toHaveProperty("planoDeQuitacao");
  });
});
