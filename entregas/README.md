# Casa contemporânea em EPS — Cajamar/SP — Estudo conceitual

> **Referência inicial para conversar com arquiteto e engenheiro.** Todas as medidas são aproximadas e conceituais. Este material **não é** projeto executivo, cálculo estrutural, ART/RRT nem aprovação municipal, e **não afirma que o projeto é aprovável em Cajamar**.

## Como abrir o 3D (mais fácil)

1. **Link direto (online):** https://raw.githack.com/norts023/vex-robo/ccr-db800c21-jjvkqa/entregas/14_experiencia_3d_ARQUIVO_UNICO.html
2. **Offline:** baixe `14_experiencia_3d_ARQUIVO_UNICO.html` e dê **duplo clique**. Ele abre no Chrome, Edge ou Firefox e não precisa de nenhum outro arquivo.

Modelo simples de consulta: `14_modelo_3d_ARQUIVO_UNICO.html`. Estudo conceitual, medidas aproximadas.

## Entregáveis

| # | Arquivo | Conteúdo |
|---|---|---|
| 00 | `00_premissas.md` | Premissas físicas, legais (hipóteses) e de custo |
| 01 | `01_conceito.md` | Conceito e fachada |
| 02 | `02_planta_terreo.svg / .pdf / .dxf` | Planta conceitual cotada do térreo |
| 03 | `03_planta_superior.svg / .pdf / .dxf` | Planta conceitual cotada do superior |
| 04 | `04_tabela_areas.xlsx` | Áreas com fórmulas, fechamento por pavimento, TO/TP |
| 05 | `05_memorial_descritivo.md` | Ambientes, móveis, acabamentos, iluminação |
| 06 | `06_paleta_materiais.md` | Cores, materiais e vegetação |
| 07 | `07_iluminacao.md` | Pontos, temperaturas de cor, circuitos |
| 08 | `08_sacada_garagem.md` | Sacada-jardim: estrutura (pendência), impermeabilização, drenagem |
| 09 | `09_solucao_EPS.md` | Sistema misto EPS + estrutura; hipóteses e riscos |
| 10 | `10_orcamento.xlsx` | 3 cenários, 22 categorias, materiais × serviços, fontes |
| 11 | `11_prazo_obra.md` | Prazo por etapa |
| 12 | `12_pendencias.md` | O que confirmar antes de executar |
| 13 | `13_decisoes_inconsistencias.md` | Decisões I-1 a I-9 |
| 14 | `14_modelo_3d/index.html` | Modelo 3D de consulta (Three.js, offline) |
| 14 | `14_modelo_3d/experiencia.html` | **Experiência 3D**: passeio em 1ª pessoa, tour guiado, sol real, noite com LEDs, obra por etapas, vista explodida, cortes. Ver `14_modelo_3d/LEIA-ME.md` |
| — | `imagens/*.png` | Vistas conceituais geradas do 3D (`exp_*` = experiência) (fachada, aérea, fundos, sala/cozinha, gourmet, lavanderia, suíte/closet, escritório, sacada, garagem) |
| — | `dados/*.csv` | **Fonte única** de plantas, tabela, 3D e orçamento |
| — | `scripts/` | Geradores e verificação |

## Como regerar e verificar

```bash
pip install openpyxl ezdxf          # + LibreOffice para recalcular fórmulas
python3 scripts/gerar_tudo.py       # tabela, plantas, 3D, orçamento + verificação
node scripts/renderizar.js          # PDFs das plantas e imagens (requer playwright)
```

A verificação (`scripts/verificar.py`) checa: fechamento de áreas (≤ 2%), sobreposição, lote = 140 m², superior apoiado no térreo, recuo hipotético, janelas a ≥ 1,50 m das divisas (CC art. 1.301), garagem com 2 carros + moto, TO/TP, mesmo hash de dados em plantas, 3D e tabela, fórmulas recalculadas no LibreOffice e aviso de "medidas aproximadas" nos documentos. Resultado atual: **0 falhas e 3 avisos** (folga da porta do carro 1, TO acima da hipótese, área acima da meta). Os três estão documentados em `13_decisoes_inconsistencias.md`.

## Resumo

**Decidido:**
- Garagem de 7,00 × 5,30 m para 2 carros + moto, com entrada social pela faixa central coberta até uma porta pivotante de 2,60 m.
- Escada em U com depósito sob o patamar.
- Pátio/poço de luz que ventila lavabo, lavanderia, cozinha, banheiros, closet e quarto.
- Sala e cozinha integradas (26,5 m² úteis) com península; gourmet de 14,5 m² úteis e jardim de fundo.
- Escritório independente no superior (9,9 m², com sofá-cama). O quarto reversível do térreo foi eliminado.
- Suíte, closet e banho em sequência ao fundo; sacada descoberta de 7,00 × 1,50 m.

**Áreas:**

| | Valor |
|---|---|
| Térreo | 100,82 m² |
| Superior | 74,20 m² |
| **Área construída total** | **175,02 m²** (157,5 m² úteis) |
| Sacada (não computada, hipótese) | 10,50 m² |
| TO | 72,0% |
| TP | 17,9% |

**Conflitos expostos:**
- A área total supera a meta de 125–140 m².
- A TO supera a hipótese de 70%.
- O orçamento de R$ 360–480 mil é insuficiente: econômico ≈ R$ 497 mil, intermediário ≈ R$ 681 mil, alto ≈ R$ 892 mil. As alternativas de corte estão em I-6 e I-9.
- Lavanderia (3,5 m²) e closet (6,3 m²) ficaram abaixo da referência.

**Hipóteses:** recuos, TO, TP, cômputo da sacada, orientação norte, paredes de 0,15 m, pé-direito, tipo de fundação e estrutura, desempenho acústico e ao fogo do EPS, percentuais do orçamento.

**Depende de profissional habilitado:** levantamento e sondagem, projeto legal e aprovação, cálculo estrutural (vigas de 7 m, laje da sacada-jardim), projeto de instalações, impermeabilização, exaustão da churrasqueira, especificação do sistema EPS e orçamentos locais.
