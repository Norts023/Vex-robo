// Leitura de CSV com aspas, quebras de linha dentro de campos e separador detectado automaticamente.

export type Separador = ";" | "," | "\t";

export function detectarSeparador(texto: string): Separador {
  const primeiraLinha = texto.replace(/^﻿/, "").split(/\r?\n/, 1)[0] ?? "";
  const contar = (s: string) => primeiraLinha.split(s).length - 1;

  const candidatos: Separador[] = [";", ",", "\t"];
  return candidatos.reduce((melhor, atual) => (contar(atual) > contar(melhor) ? atual : melhor), ";");
}

export function parseCsv(texto: string, separador: Separador = detectarSeparador(texto)): string[][] {
  const fonte = texto.replace(/^﻿/, "");
  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = "";
  let dentroDeAspas = false;

  for (let i = 0; i < fonte.length; i++) {
    const c = fonte[i];

    if (dentroDeAspas) {
      if (c === '"') {
        if (fonte[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          dentroDeAspas = false;
        }
      } else {
        campo += c;
      }
    } else if (c === '"') {
      dentroDeAspas = true;
    } else if (c === separador) {
      linha.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && fonte[i + 1] === "\n") i++;
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = "";
    } else {
      campo += c;
    }
  }

  if (campo !== "" || linha.length > 0) {
    linha.push(campo);
    linhas.push(linha);
  }

  return linhas.filter((l) => l.some((c) => c.trim() !== ""));
}
