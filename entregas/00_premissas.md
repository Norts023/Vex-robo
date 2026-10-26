# 00 — Premissas do estudo conceitual

> **Estudo conceitual. Todas as medidas são aproximadas** e servem para conversar com arquiteto e engenheiro. Este material não substitui projeto executivo, cálculo estrutural, ART/RRT nem aprovação na Prefeitura de Cajamar.

## 1. Fonte única de dados

| Arquivo | Conteúdo | Usado por |
|---|---|---|
| `dados/ambientes.csv` | retângulos de cada ambiente (x0, y0, x1, y1), tipo, se entra na área computável, lados abertos | tabela de áreas, plantas, 3D, orçamento |
| `dados/pavimentos.csv` | área declarada, cota de piso e pé-direito de cada pavimento | tabela, 3D, verificação |
| `dados/aberturas.csv` | portas, janelas e vãos | plantas, 3D, verificação legal (art. 1.301 CC) |
| `dados/externas.csv` | superfícies externas e coeficiente de permeabilidade | aba "Lote" da tabela, 3D |
| `dados/mobiliario.csv` | mobiliário e veículos indicativos | plantas, 3D, teste da garagem |

O hash dos CSV (impresso nas plantas, na tabela e no 3D) mostra que todos os arquivos vêm da mesma versão dos dados. Para regerar tudo e rodar a verificação: `python3 scripts/gerar_tudo.py`. Requisitos: Python 3, `openpyxl`, `ezdxf` e LibreOffice para recalcular as fórmulas.

**Eixos:** x é a largura (0 = divisa esquerda, olhando da rua) e y é a profundidade (0 = alinhamento frontal, 20 = fundo).

## 2. Premissas físicas

| # | Premissa | Valor adotado | Status |
|---|---|---|---|
| P-1 | Lote | 7,00 × 20,00 m = 140,00 m², plano | informado no briefing; **topografia não informada** (hipótese de lote plano) |
| P-2 | Orientação solar | fundo do lote voltado para o **norte** | **HIPÓTESE**; confirmar em levantamento. Ver impacto em `01_conceito.md` |
| P-3 | Espessura de parede acabada | 0,15 m (painel EPS + argamassa nas 2 faces) | conceitual; não é a espessura executiva |
| P-4 | Pé-direito | 2,70 m nos dois pavimentos | conceitual |
| P-5 | Laje entre pisos | 0,18 m; piso a piso de 2,88 m | conceitual; depende do cálculo estrutural |
| P-6 | Cota do piso térreo | +0,15 m sobre o terreno | conceitual |
| P-7 | Área bruta | retângulos nos eixos; paredes externas contadas para dentro | método do estudo |
| P-8 | Área útil | área bruta menos 0,15 m em lado externo, 0,075 m em lado interno e 0 em lado aberto | estimativa |

## 3. Premissas legais (NÃO confirmadas)

Pesquisei a legislação de Cajamar em 26/10/2026 e **não consegui confirmar os parâmetros**. Encontrei referência ao Plano Diretor (Lei Complementar nº 179/2019, com minuta de revisão de 2023) e a uma "Lei 181/2019" de uso e ocupação do solo citada em ata do COMDEMA. Não consegui acessar as tabelas de zoneamento com recuos, TO e TP. Portanto:

| # | Parâmetro | Valor adotado no estudo | Status |
|---|---|---|---|
| L-1 | Recuo frontal | 4,00 m | **HIPÓTESE** (valor usual na RMSP) |
| L-2 | Recuos laterais | 0 m (encostado nas divisas, sem aberturas) | **HIPÓTESE** |
| L-3 | Recuo de fundo | 0 m no térreo (gourmet sem aberturas para a divisa) | **HIPÓTESE** |
| L-4 | Taxa de ocupação máxima | 70% | **HIPÓTESE** |
| L-5 | Taxa de permeabilidade mínima | 15% | **HIPÓTESE** |
| L-6 | Afastamento de janela à divisa | 1,50 m | **Código Civil, art. 1.301** (lei federal). Aplicável independentemente do município |
| L-7 | Iluminação e ventilação | aberturas mínimas usuais (≈ 1/6 da área do piso em permanência prolongada, ≈ 1/8 em transitória) | **HIPÓTESE**; confirmar no Código de Obras de Cajamar e no Código Sanitário Estadual (Decreto 12.342/1978) |
| L-8 | Sacada descoberta | não computada na área construída | **HIPÓTESE**; confirmar a regra municipal |
| L-9 | Zoneamento do lote | desconhecido | **PENDENTE**; consultar a certidão de uso do solo do lote |

**Nada neste estudo afirma que o projeto é aprovável em Cajamar.** Todos os parâmetros municipais dependem de consulta formal à Prefeitura (Secretaria de Planejamento/Obras) com a matrícula e a inscrição do lote.

## 4. Premissas de programa

- Os itens do briefing foram tratados como **requisitos**. As áreas de referência foram tratadas como **valores-alvo de área útil**.
- "Área construída" inclui a garagem e a gourmet, porque ambas são cobertas. A sacada descoberta, o pátio e o poço de luz **não** entram.
- Veículos de referência: carro de até 1,80 × 4,55 m (médio/SUV compacto) e moto de 0,90 × 2,20 m.
- Itens fora do escopo de custo: móveis planejados completos, eletrodomésticos, muro, portão, calçada, decoração e equipamentos de climatização e aquecimento.

## 5. Premissas de custo

- Base: CUB-SP (SindusCon-SP) de agosto/2026, padrões R1-B, R1-N e R1-A. Os valores foram obtidos de fonte secundária (Portal DORI). A referência cruzada é o SINAPI/IBGE. Ver `10_orcamento.xlsx`, aba "Fontes".
- A distribuição por categoria, as verbas, a administração e a contingência são **estimativas sem fonte verificável**.
