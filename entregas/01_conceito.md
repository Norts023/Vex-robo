# 01 — Conceito arquitetônico e fachada

> Estudo conceitual. Medidas aproximadas, não executivas. Imagens em `imagens/`, geradas a partir do modelo 3D (`14_modelo_3d/index.html`). São volumetrias esquemáticas, não renders fotorrealistas.

## Ideia central

**Uma "caixa" grafite sobre uma base clara, em um lote de 7 × 20 m organizado em faixas transversais.** Partindo da rua:

1. **Recuo frontal (4,00 m, hipótese)** com jardim e acesso. Trilhos de concreto para os carros entre faixas de grama e caminho de placas para pedestres.
2. **Garagem** (2 carros + moto) **aberta para o recuo**. A faixa central dela é também o **caminho coberto até a porta pivotante alta**.
3. **Núcleo de circulação e serviço:** escada em U, hall, lavabo e lavanderia, todos colados a um **pátio de serviço/poço de luz descoberto** (1,60 × 3,50 m) que atravessa os dois pavimentos. O pátio leva luz e ventilação natural ao lavabo, à lavanderia, à pia da cozinha, ao banheiro social, ao closet e ao quarto. Ele também serve de varal.
4. **Sala e cozinha integradas** na largura total, abertas por esquadrias de correr para a gourmet e para o jardim de fundo. A ventilação é cruzada entre o pátio (frente) e o jardim (fundo).
5. **Gourmet coberta e jardim de fundo**, voltados para o norte (hipótese), para receber sol no inverno.

No pavimento superior, a área íntima fica **ao fundo**, longe da rua e com vista para o jardim: suíte, closet e banho em sequência. Escritório e quarto ficam à frente, abertos para a sacada-jardim. Um hall íntimo compacto, de 2,0 × 3,5 m e com claraboia linear, elimina corredores.

### Por que essa organização

- **Verticalização sem corredor:** a escada e o hall ocupam a mesma faixa nos dois pavimentos, e cada porta abre direto para o hall.
- **Privacidade:** o visitante circula por hall, lavabo, sala e gourmet. A área íntima só é acessível pela escada.
- **Lote estreito:** as paredes laterais ficam nas divisas, **sem janelas**, conforme o Código Civil, art. 1.301. Toda abertura lateral olha para o pátio a mais de 1,50 m da divisa. A conferência está em `scripts/verificar.py`.
- **Permeabilidade:** recuo gramado + pátio com brita + jardim de fundo = 25,1 m² (17,9%, contra 15% de hipótese).

### Se a orientação for outra (norte é hipótese)

- **Frente para o norte:** a sacada e o escritório ficam muito expostos ao sol. Seria preciso brise ou ripado na frente do quarto e vidro de controle solar.
- **Frente para o oeste:** manter o pórtico mais profundo (0,60 m) e cortinas blackout no quarto.
- **Fundo para o sul:** a gourmet e a sala ficam frias e com pouca luz no inverno. Avaliar inverter a casa (gourmet na frente não é viável com a garagem) ou aumentar o pátio.

## Fachada

| Elemento | Solução conceitual |
|---|---|
| Volumes | Base térrea clara, recuada sob a laje, e **pórtico grafite** (cinza-chumbo) que emoldura a sacada e o pavimento superior, formando a "caixa" de dois pavimentos bem definida |
| Cor predominante | Off-white quente / cinza-claro quente (textura acrílica fina) nas laterais, na base e na platibanda |
| Volume de destaque | Pórtico grafite fosco (chapa metálica ou ACM, ou argamassa pigmentada) |
| Madeira | **Ripado vertical amadeirado** (madeira tratada ou porcelanato/WPC amadeirado) entre as portas da sacada, subindo até a platibanda, e ripado em volta da porta de entrada |
| Porta principal | **Pivotante alta**, 1,00 × 2,60 m, em madeira natural ou lâmina amadeirada, puxador vertical preto |
| Esquadrias | Alumínio **preto fosco**, linha de correr com folhas grandes; guarda-corpo de **vidro laminado** com perfil preto |
| Cobertura | **Laje impermeabilizada + telhado embutido termoacústico** atrás de **platibanda** de ~0,85 m; claraboia linear sobre a escada |
| Garagem | Frente aberta com viga revestida em grafite sobre o vão de 7 m. A laje da garagem é o piso da sacada, o que integra a garagem ao volume |
| Muro e portão | **Fora do escopo de custo.** Sugestão: muro baixo em cinza-claro ou areia, portão de lâminas verticais pretas (permeável à vista) |
| Jardim frontal | Grama-esmeralda entre trilhos de concreto, forração e arbusto de baixa manutenção junto às divisas, uma árvore pequena (ex.: resedá-anão ou manacá-da-serra-anão) no canto |
| Iluminação de fachada | Balizadores no caminho, spots embutidos na laje da garagem, fita LED 2700 K no pórtico e nas jardineiras |

Imagens: `imagens/01_fachada.png`, `02_aerea.png`, `03_fundos.png`, `10_sacada.png`, `11_garagem.png`.
