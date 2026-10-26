# 13 — Registro de decisões: inconsistências I-1 a I-9

> Medidas aproximadas e conceituais. Os números vêm de `dados/ambientes.csv` e de `04_tabela_areas.xlsx`. "Útil" = área estimada descontando paredes de 0,15 m.

Resumo: **as nove inconsistências foram decididas.** Duas delas (I-6 e I-9) mostram que o programa completo **não cabe** na meta de 125–140 m² nem no orçamento de R$ 360–480 mil no padrão intermediário. Esse conflito está exposto abaixo, com alternativas, e não foi escondido.

---

## I-1 — Área gourmet (15 m² declarados × faixa de 7 m)

- **(a) Problema:** uma faixa de 7,00 m de largura com cerca de 3 m de profundidade dá mais de 21 m², e não 15 m².
- **(b) Decisão:** gourmet coberta com **5,20 × 3,10 m (eixo) = 16,12 m² brutos / 14,52 m² úteis**. Os 1,80 × 3,10 m restantes (5,58 m²) viram **jardim de fundo permeável** com árvore pequena, no lado leste (direito), para onde a gourmet fica aberta. Com 3,10 m de profundidade cabem a bancada e a churrasqueira (0,60 m), a circulação (≥ 0,90 m) e a mesa de 6 lugares girada no sentido da profundidade.
- **(c) Alternativas:** (1) gourmet na largura total, com 21,7 m² (perde o jardim, a TP cai para cerca de 14% e a TO sobe para cerca de 76%); (2) gourmet sob pérgola, sem laje (pode deixar de ser computável; a proteção contra chuva fica parcial, com toldo ou vidro); (3) profundidade de 2,60 m (área menor, mas a mesa de 6 lugares não cabe com circulação).
- **(d) Impacto:** +1,12 m² brutos em relação aos 15 m²; ganha 5,58 m² permeáveis. Custo: categoria 20 e área equivalente (coeficiente 0,75).

## I-2 — Sala íntima/escritório (10 m² na lista × 20 m² na planta)

- **(a) Problema:** a lista e a planta divergem por um fator de 2.
- **(b) Decisão:** **10 m² (3,00 × 3,80 m eixo; 9,92 m² úteis)**, como **escritório independente com porta**. A sala íntima de 20 m² não cabe em um lote de 7 m sem tirar o quarto ou o closet do pavimento superior. Os 10 m² comportam mesa de 1,50 m com monitor, cadeira, estante e um sofá-cama compacto (0,85 × 1,90 m), o que o torna também o quarto de hóspedes reversível.
- **(c) Alternativas:** (1) 20 m² unindo o escritório e o quarto em uma sala íntima (a casa passa a ter só uma suíte e um escritório); (2) hall íntimo ampliado como sala de TV, o que exigiria aumentar a profundidade e reduzir a suíte.
- **(d) Impacto:** −10 m² em relação à planta de referência, com custo proporcional menor (cerca de R$ 33 mil no intermediário, com administração e contingência).

## I-3 — Sacada (8 m² na lista × 7 × 3 m = 21 m²)

- **(a) Problema:** uma sacada de 3 m sobre toda a garagem teria cerca de 21 m² e tomaria a frente do pavimento superior.
- **(b) Decisão:** **sacada de 7,00 × 1,50 m = 10,50 m² brutos**, com jardineiras de 0,60 m nas extremidades e cerca de 9 m² livres. Cabem duas poltronas, uma mesa lateral e circulação de cerca de 0,45 m (justo). A sacada é **descoberta**, emoldurada por um pórtico grafite. **Hipótese: não entra na área construída.** Muitos municípios computam sacadas cobertas e às vezes também as descobertas acima de certa profundidade; confirmar em Cajamar. Ela fica sobre a laje da garagem (não é balanço) e o restante da garagem é coberto pelo escritório e pelo quarto.
- **(c) Alternativas:** profundidade de 1,80 m (mais confortável), que tira 0,30 m de profundidade do escritório e do quarto; 2,40 m de profundidade cria uma "varanda-jardim" e reduz o quarto a cerca de 9 m².
- **(d) Impacto:** área computável igual a 0 (hipótese); área equivalente de 10,5 × 0,40 = 4,2 m²; custos de impermeabilização reforçada e de jardineiras (categorias 9 e 22). **A estrutura é pendência de cálculo** (ver `08_sacada_garagem.md`).

## I-4 — Garagem (25 m² × 7 × 4,5 = 31,5 m²)

- **(a) Problema:** 25 m² não comportam 2 carros e 1 moto, e mesmo 4,50 m de profundidade são insuficientes para carros médios com circulação.
- **(b) Decisão:** **7,00 × 5,30 m (eixo) = 37,10 m² brutos / 35,01 m² úteis (6,70 × 5,23 m)**. Distribuição na largura útil: carro 1 (1,80 m, com 0,55 m livres para a porta do motorista junto à divisa) + **faixa central de 2,05 m** (moto de 0,90 × 2,20 m junto à rua e passagem de pedestre de 0,85 m até a porta principal) + carro 2 (1,80 m, com 0,50 m do lado do passageiro). Os carros entram de frente; as portas dianteiras abrem na zona de y ≈ 6,9–7,9 m, atrás da moto, sem conflito. Piso de concreto polido ou porcelanato de tráfego antiderrapante e spots embutidos.
- **Respondendo ao briefing:** vagas de 2,50 × 5,00 m lado a lado (5,00 m) mais a moto (0,90 m) somam 5,90 m. Cabem em 6,70 m úteis, mas **justas**. A porta do motorista do carro 1 abre só parcialmente (0,55 m, contra 0,60–0,70 m recomendados). Isso aparece como AVISO no `verificar.py`.
- **(c) Alternativas:** garagem com 5,50 m de profundidade, para SUVs grandes (+1,1 m²); carro 1 deslocado 0,10 m para a direita (a passagem ao lado da moto cai para 0,75 m).
- **(d) Impacto:** +12,1 m² brutos em relação aos 25 m². Esse é o principal motivo do aumento da área total (ver I-6).

## I-5 — Escritório independente

- **(a) Problema:** o texto pede escritório independente no 2º pavimento; a planta tem escritório reversível no térreo e sala íntima/escritório em cima.
- **(b) Decisão:** **um único escritório independente no 2º pavimento** (decisão I-2), com porta própria para o hall íntimo, acesso à sacada, luz natural da fachada e sofá-cama para hóspedes. O **escritório/quarto reversível do térreo foi eliminado**. No lote de 7 m não há onde dar a ele janela a 1,50 m da divisa sem tirar o pátio de luz ou o jardim, e os ~9 m² liberados mantêm a sala e a cozinha com 26,5 m² úteis.
- **(c) Alternativas:** manter o reversível no térreo, no lugar do lavabo e da lavanderia, levando a lavanderia para cima. Isso contraria o briefing (lavanderia no térreo) e aumenta a área.
- **(d) Impacto:** −8,7 m² brutos no térreo (cerca de R$ 29 mil a menos no intermediário). **Perde-se o quarto acessível no térreo**, o que é relevante se houver idosos. Registrado como pendência de decisão do cliente.

## I-6 — Totais (70 + 65 m² não fecham)

- **(a) Problema:** só os ambientes de referência do térreo já somam cerca de 87 m² (sem paredes) contra 70 m² declarados. O superior soma cerca de 64 m² sem paredes nem escada.
- **(b) Decisão:** a tabela foi refeita de baixo para cima e **fecha exatamente** (soma dos ambientes = área declarada; tolerância 2%; desvio 0,0%):

| Pavimento | Área bruta (m²) | Área útil (m²) | Paredes/estrutura (m²) |
|---|---|---|---|
| Térreo | **100,82** | 92,55 | 8,27 |
| Superior | **74,20** | 64,92 | 9,28 |
| **Área construída total** | **175,02** | 157,46 | 17,56 |
| Sacada descoberta (não computada, hipótese) | 10,50 | — | — |

  Área construída sem garagem e gourmet: 121,80 m². TO resultante: **72,0%**. TP resultante: **17,9%** (25,10 m²).
- **CONFLITO:** **175 m² superam a meta de 125–140 m² em 35 m²**, e a TO de 72% supera a TO hipotética de 70%. O programa completo, com garagem realista e gourmet coberta, **não cabe** na meta.
- **(c) Alternativas para chegar perto de 140 m²:** (1) gourmet sob pérgola não computável, −16,1 m², TO de 60,5%; (2) garagem de 5,0 m de profundidade, para carros de até 4,40 m, −2,1 m²; (3) eliminar o poço de luz e cobrir o pátio (pior iluminação, sem ganho de área computável); (4) programa menor no superior, unindo escritório e quarto (−11 m²). A combinação (1)+(4) leva a cerca de 148 m².
- **(d) Impacto:** área equivalente de custo de 165,92 m². É a base do orçamento (I-9).

## I-7 — Escada (L/U × reta)

- **(a) Problema:** o documento pede L ou U; a planta mostra escada reta.
- **(b) Decisão:** **escada em U** em uma faixa de 2,00 × 3,50 m (eixo), junto à divisa esquerda. São 16 espelhos de cerca de 18 cm e pisos de 27 cm (fórmula de Blondel: 2 × 18 + 27 = 63 cm). Lance 1 com 9 espelhos, que sobe da sala para a frente; patamar frontal de cerca de 1,85 × 1,19 m; lance 2 com 7 espelhos, que volta para o fundo; chegada em uma plataforma de 0,83 m que se liga ao hall íntimo. Lances de 0,85 m e montante central metálico preto. **Depósito sob o patamar** (cerca de 1,85 × 1,0 m, altura livre de ~1,40 m). A reta precisaria de cerca de 4,6 m de comprimento contínuo mais o desembarque, o que cortaria a sala ao meio no lote de 7 m.
- **(c) Alternativas:** L (exige ~2,3 × 3,3 m e gera um canto morto maior); reta encostada na divisa (consome ~5,5 m da profundidade da sala).
- **(d) Impacto:** 7,00 m² brutos por pavimento (contra ~5,25 m² da referência). A largura de 0,85 m por lance e a altura livre de 2,10 m sobre o 3º degrau são **conceituais** e devem ser conferidas no Código de Obras e na NBR 9077 (quando aplicável).

## I-8 — Entrada principal

- **(a) Problema:** a planta não define a entrada; o briefing pede porta alta e circulação protegida.
- **(b) Decisão:** **entrada pela frente, através da faixa central coberta da garagem.** O portão de pedestres do muro (fora do orçamento) leva ao caminho de placas de concreto do recuo (1,20 m), que continua pela faixa central da garagem (0,85 m livres ao lado da moto), coberta pela laje do pavimento superior, até a **porta pivotante de madeira de 1,00 × 2,60 m** no fundo da garagem. A porta fica emoldurada por ripado amadeirado e visível da rua. Da porta: hall de 1,40 m → sala. O lavabo fica à direita do hall e a escada à esquerda. O visitante não passa pela área íntima nem pela lavanderia.
- **(c) Alternativas:** entrada lateral pelo pátio (exigiria corredor lateral de 1,50 m ao longo de toda a casa, com −10 m² de sala e cozinha); entrada frontal com hall na largura da fachada (exigiria garagem para um carro só).
- **(d) Impacto:** área zero adicional. Exige que a garagem fique livre e iluminada (spots e balizadores) e faz da viga sobre o vão de 7 m um elemento de fachada.

## I-9 — Orçamento (R$ 360–480 mil)

- **(a) Problema:** a verba é baixa para cerca de 135 m² com acabamento moderno em dois pavimentos, e o estudo chegou a 175 m².
- **(b) Decisão / resultado:** estimativa paramétrica (`10_orcamento.xlsx`) = área equivalente de 165,92 m² × CUB-SP de ago/2026, mais verbas fora do CUB, administração e contingência de 10%:

| Cenário | Total estimado | R$/m² construído | Situação |
|---|---|---|---|
| Econômico (R1-B, administração própria) | **≈ R$ 497 mil** | ≈ 2.840 | ~R$ 17 mil acima do teto |
| Intermediário (R1-N, empreiteira) | **≈ R$ 681 mil** | ≈ 3.890 | ~R$ 201 mil acima do teto |
| Alto padrão (R1-A) | **≈ R$ 892 mil** | ≈ 5.100 | ~R$ 412 mil acima do teto |

  **Conclusão:** **a verba de R$ 360–480 mil é insuficiente** para o padrão pedido ("intermediário a superior") com este programa. Um valor realista para o intermediário fica entre **R$ 620 e 720 mil** (±15%, antes de orçamentos locais).
- **(c) O que precisaria ser cortado para chegar a ~R$ 480 mil:**
  1. Executar no padrão econômico com administração própria e sem contingência (≈ R$ 452 mil). **Risco alto.**
  2. Ou reduzir a área: gourmet sob pérgola (≈ −R$ 40 mil), unir escritório e quarto (≈ −R$ 36 mil), esquadrias de linha intermediária em vez de linha preta premium (≈ −R$ 15 mil), sacada sem jardineira estrutural (≈ −R$ 8 mil). O resultado é ≈ R$ 580 mil no intermediário. Ainda fica acima do teto.
  3. Ou executar por etapas: entregar a casa habitável com pintura simples, iluminação básica e gourmet sem acabamento (≈ −R$ 60–80 mil), deixando acabamentos para uma segunda fase.
- **(d) Impacto:** decisão de cliente **pendente** (ver `12_pendencias.md`, item C-1).
