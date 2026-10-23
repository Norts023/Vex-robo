import { describe, expect, it } from "vitest";
import { compararEstrategias, type Divida, simularQuitacao } from "./divida";

const cartao: Divida = { id: "cartao", nome: "Cartão", saldoCentavos: 300000, taxaJurosMensal: 10, parcelaMinimaCentavos: 15000 };
const emprestimo: Divida = { id: "emp", nome: "Empréstimo", saldoCentavos: 500000, taxaJurosMensal: 2, parcelaMinimaCentavos: 30000 };
const cheque: Divida = { id: "cheque", nome: "Cheque especial", saldoCentavos: 80000, taxaJurosMensal: 8, parcelaMinimaCentavos: 5000 };

describe("simularQuitacao", () => {
  it("sem dívidas, está quitado no mês 0", () => {
    const r = simularQuitacao([], 100000, "avalanche");
    expect(r).toMatchObject({ viavel: true, meses: 0, totalJurosCentavos: 0 });
  });

  it("recusa orçamento menor que a soma das parcelas mínimas", () => {
    const r = simularQuitacao([cartao, emprestimo], 40000, "bola-de-neve");
    expect(r).toMatchObject({ viavel: false, motivo: "orcamento-insuficiente" });
  });

  it("dívida única sem juros: quita em saldo / orçamento meses, sem juros", () => {
    const unica: Divida = { id: "a", nome: "A", saldoCentavos: 100000, taxaJurosMensal: 0, parcelaMinimaCentavos: 1000 };
    const r = simularQuitacao([unica], 25000, "bola-de-neve");
    expect(r.viavel).toBe(true);
    expect(r.meses).toBe(4); // 1000 + 24000 nos meses 1 a 4 (100000 / 25000)
    expect(r.totalJurosCentavos).toBe(0);
    expect(r.totalPagoCentavos).toBe(100000);
  });

  it("juros calculados mês a mês: 1000 a 10% com parcela de 500 (mês 1: 1100-500=600; mês 2: 660-500=160; mês 3: 176-176=0)", () => {
    const d: Divida = { id: "a", nome: "A", saldoCentavos: 100000, taxaJurosMensal: 10, parcelaMinimaCentavos: 50000 };
    const r = simularQuitacao([d], 50000, "bola-de-neve");
    // Mês 1: juros 10000, saldo 110000, paga 50000 -> 60000
    // Mês 2: juros 6000, saldo 66000, paga 50000 -> 16000
    // Mês 3: juros 1600, saldo 17600, paga 17600 -> 0
    expect(r.meses).toBe(3);
    expect(r.totalJurosCentavos).toBe(10000 + 6000 + 1600);
    expect(r.totalPagoCentavos).toBe(100000 + 17600);
  });

  it("a quitação total paga exatamente principal + juros", () => {
    const r = simularQuitacao([cartao, emprestimo, cheque], 80000, "avalanche");
    expect(r.viavel).toBe(true);
    const principal = cartao.saldoCentavos + emprestimo.saldoCentavos + cheque.saldoCentavos;
    expect(r.totalPagoCentavos).toBe(principal + r.totalJurosCentavos);
  });

  it("bola de neve quita primeiro a menor dívida", () => {
    const r = simularQuitacao([cartao, emprestimo, cheque], 80000, "bola-de-neve");
    expect(r.ordem[0].id).toBe("cheque");
  });

  it("avalanche quita primeiro a maior taxa de juros", () => {
    const r = simularQuitacao([cartao, emprestimo, cheque], 80000, "avalanche");
    expect(r.ordem[0].id).toBe("cartao"); // 10% ao mês, a maior taxa
    expect(r.ordem.map((o) => o.id)).toEqual(["cartao", "cheque", "emp"]);
  });

  it("avalanche paga no total menos ou igual juros que bola de neve nesse cenário", () => {
    const { bolaDeNeve, avalanche } = compararEstrategias([cartao, emprestimo, cheque], 80000);
    expect(avalanche.totalJurosCentavos).toBeLessThanOrEqual(bolaDeNeve.totalJurosCentavos);
  });

  it("orçamento que não cobre os juros é reportado como não quitável, sem travar", () => {
    const d: Divida = { id: "a", nome: "A", saldoCentavos: 1000000, taxaJurosMensal: 50, parcelaMinimaCentavos: 10000 };
    const r = simularQuitacao([d], 10000, "avalanche");
    expect(r).toMatchObject({ viavel: false, motivo: "nao-quita-no-prazo" });
  });

  it("dívidas com saldo zero são ignoradas", () => {
    const zerada: Divida = { ...cheque, id: "z", saldoCentavos: 0 };
    const r = simularQuitacao([zerada], 10000, "bola-de-neve");
    expect(r.meses).toBe(0);
  });
});
