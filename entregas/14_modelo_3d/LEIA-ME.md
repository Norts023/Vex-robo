# 14 — Modelo 3D e Experiência 3D

> Modelos **conceituais**: as medidas são aproximadas e não executivas. Os dois arquivos são gerados por `scripts/gerar_3d.py` a partir dos **mesmos CSV** das plantas e da tabela de áreas (hash impresso na tela). Os dois funcionam offline: basta abrir no navegador (Chrome, Edge ou Firefox).

| Arquivo | Para que serve |
|---|---|
| `index.html` | Modelo de consulta: vistas prontas, cortes por pavimento, rótulos de área |
| `experiencia.html` | **Experiência interativa completa** (abaixo) |
| `dados_modelo.json` | Dados exportados do CSV (ambientes, paredes já com aberturas, esquadrias, mobiliário) |

## O que dá para fazer na `experiencia.html`

| Recurso | Como usar | O que mostra |
|---|---|---|
| 🚶 **Passeio em 1ª pessoa** | botão *Passeio* → clicar na tela → **W A S D** + mouse, **Shift** corre, **Esc** sai | Entra pelo recuo, passa pela faixa central da garagem, pela porta pivotante, pelo hall e pela sala, e **sobe a escada em U degrau por degrau** (16 espelhos de ~0,18 m). As paredes e janelas colidem e as portas de correr ficam abertas. O HUD mostra o ambiente atual com a área útil da tabela; o minimapa mostra a posição |
| 🎬 **Tour guiado** | botão *Tour guiado* | Câmera cinematográfica de ~75 s: rua → garagem → hall → sala → cozinha → gourmet → jardim → escada → hall íntimo → suíte → closet → escritório → sacada → vista aérea |
| ☀️ **Sol real de Cajamar** | sliders *Hora*, *Data*, *Norte* e ▶ *animar dia* | Posição solar calculada (latitude −23,3°, declinação por data) com sombras em tempo real. Permite testar **outras orientações de norte** (a orientação do lote é hipótese) e ver a insolação da gourmet, da suíte e da sacada no inverno e no verão |
| 🌙 **Noite + LEDs** | botão *Noite + LEDs* | Plano de iluminação de `07_iluminacao.md`: sanca da sala, perfil sob armários, pendentes da península, LED da cabeceira, degraus, balizadores da garagem, fita no pórtico, jardineiras e uplights do jardim |
| 🏗️ **Obra por etapas** | slider *Obra* ou ▶ *construir* | Terreno → fundação/baldrame → **estrutura complementar** (pilares, vigas de ~7 m, lajes) → **painéis EPS** com malha → revestimento → cobertura → esquadrias → acabamentos → paisagismo. Os meses vêm de `11_prazo_obra.md` e são aproximados |
| 💥 **Vista explodida** | slider *Explodir* | Separa térreo, superior e cobertura para ler os dois pavimentos e a escada |
| ✂️ **Cortes** | sliders *Corte longitudinal* e *Corte horizontal* | Seção em qualquer profundidade (y) ou altura, só na casa; o terreno continua inteiro |
| 🩻 **Raio-X** | botão *Raio-X* | Paredes translúcidas para ver o layout dentro do volume |
| 📋 **Ficha do ambiente** | clicar em um piso (modo órbita) | Dimensões, área bruta, área útil e se computa, os mesmos números da tabela 04 |

## Parâmetros de URL (vistas reproduzíveis)

`experiencia.html?hora=17&dia=355&norte=0&noite=1&fase=3&exp=0.5&corte=14.5&alt=4.2&rot=1&raio=1&ficha=SUITE&ui=0`

- `cam=raio,teta,fi,x,altura,y` define a órbita.
- `eu=x,y,piso,yaw,pitch` define o passeio.
- `tour=0..1` define a posição no tour.

As imagens `imagens/exp_*.png` foram geradas assim (`scripts/renderizar.js`).

## Limitações (honestas)

- A volumetria é esquemática (caixas e texturas procedurais), não um render fotorrealista.
- O mobiliário é indicativo.
- A posição solar é aproximada: hora solar sem equação do tempo e **norte hipotético**.
- A iluminação noturna é ilustrativa: não é cálculo luminotécnico.
- A sequência de obra é ilustrativa: não é cronograma executivo.
