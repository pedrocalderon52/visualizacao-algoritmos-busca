# Style Guide

Este documento define a linguagem visual do repositório para manter consistência ao criar ou alterar telas, slides, animações e componentes.

## Objetivo visual

O projeto segue uma estética de apresentação técnica limpa, contemporânea e didática. A interface deve parecer:

- clara e leve;
- acadêmica, mas não burocrática;
- elegante sem excesso de ornamentação;
- dinâmica por meio de microanimações suaves;
- focada em leitura e compreensão visual.

Evite reinterpretar o projeto como dashboard, site institucional, landing page comercial ou interface gamer.

## Fonte de verdade

As referências visuais reais deste guia vêm de:

- `slide2.html`
- `style.css`
- `script.js`

Se houver conflito entre novas ideias e esses arquivos, priorize o padrão já implementado neles.

## Princípios de design

1. O layout principal deve ser limpo, espaçoso e centrado.
2. O slide é o elemento protagonista: fundo branco, cantos amplos, sombra suave e aparência premium.
3. O fundo externo deve ser claro e atmosférico, com gradientes radiais muito sutis.
4. O contraste deve favorecer legibilidade, usando texto escuro sobre superfícies claras.
5. Movimento existe para reforçar entendimento e refinamento visual, nunca para distrair.
6. Elementos interativos ou animados devem transmitir leveza e precisão.

## Paleta de cores

Use estas cores como base primária:

- `--bg-color: #f0f4f8`
- `--slide-bg: #ffffff`
- `--text-primary: #1e293b`
- `--text-secondary: #64748b`
- `--accent-color: #4f46e5`
- `--accent-glow: rgba(79, 70, 229, 0.08)`
- `--glass-border: rgba(0, 0, 0, 0.05)`

Cores auxiliares observadas no projeto:

- `#0f172a` para o início do gradiente do título;
- `#334155` para texto em destaque secundário;
- `#818cf8` para nós inativos;
- `#10b981` para elementos de movimento e estado ativo no canvas;
- `#94a3b8` para textos discretos de apoio.

## Regras de cor

- O indigo (`#4f46e5`) é a cor de identidade principal.
- Verde (`#10b981`) deve ser usado como cor funcional de movimento, progresso ou estado vivo, não como identidade principal.
- Não introduzir paletas escuras, neon, saturadas demais ou quentes como base do sistema.
- Bordas devem ser discretas e translúcidas.
- Glow deve ser suave e controlado.

## Tipografia

Fonte principal:

- `Outfit`, fallback `sans-serif`

Regras tipográficas:

- Títulos principais devem ser grandes, fortes e com peso alto.
- Corpo de texto deve priorizar leitura confortável.
- A hierarquia deve depender mais de tamanho, peso e cor do que de muitos estilos diferentes.
- O título principal pode usar gradiente preenchido no texto.

Referências de escala atuais:

- `h1`: até `5rem`, `700`, `letter-spacing: -1px`
- `p`: até `1.6rem`, `line-height: 1.6`, `400`
- texto da caixa de destaque: cerca de `1.4rem`
- controles auxiliares: `0.85rem`, uppercase, tracking amplo

Observação:

- A escala pode ser reduzida quando necessário para manter o slide íntegro dentro do container principal.

## Layout e composição

Estrutura base observada:

- viewport inteira ocupada pela apresentação;
- slide centralizado no meio da tela;
- slide com `90vw`, `85vh`, `max-width: 1400px`;
- borda arredondada ampla (`24px`);
- padding generoso (`4rem 5rem`);
- composição em duas colunas quando fizer sentido;
- grid com respiro amplo entre texto e visual.

Diretrizes:

- preservar respiro visual generoso;
- evitar densidade alta de informação por slide;
- em slides com texto e visual, manter o padrão de duas colunas sempre que fizer sentido;
- o conteúdo deve parecer equilibrado entre explicação e demonstração visual;
- controles e instruções devem ficar discretos no rodapé;
- nenhum componente deve vazar para fora do container principal do slide.

## Regra de Encaixe e Adaptação de Conteúdo

**O conteúdo jamais deve quebrar, vazar ou ficar invisível.** Ao projetar ou ajustar um slide, o foco absoluto da formatação é garantir que os objetos e textos não se percam fora do *frame*.

Se houver risco de colisão (com o rodapé, lateral ou sobreposição de grid), você DEVE mudar a formatação para adaptar da melhor forma possível:
- Reduza a escala tipográfica `h1` ou `p` para encaixar textos longos;
- Ajuste as frações do `grid-template-columns` para balancear a área de texto vs. imagem;
- Remova `aspect-ratio` rígidos substituindo por tamanhos fluidos (ex: `height: 55vh`);
- Reorganize blocos internos ou compacte espaçamentos (`gap`, `margin`, `padding`);
- **EVITE estruturar "frames dentro de frames"** na área visual. A estrutura padrão deve ser simples (ex: `.image-content` > `.graph-container` > `<canvas>`). Não crie tags artificiais de "placeholder de imagem" ou "análise" que distorçam as proporções ou quebrem a harmonia com o resto da apresentação.

Prioridade:
1. Manter a clareza total do conteúdo sem vazamentos (adapte o CSS ou HTML se necessário).
2. Manter a coerência com a linguagem visual refinada.

## Interação e Navegação

**Padrão de Navegação com Mouse:**
A fim de manter uma experiência de navegação consistente, intuitiva e sem atritos ao apresentar o material:
- **Botão Esquerdo ("Left-click / button 0"):** Voltar para o slide anterior (-1).
- **Botão Direito ("Right-click / button 2"):** Avançar para o próximo slide (+1).
*Nota:* Eventos de clique para navegação devem ser ignorados se o ponteiro estiver ativamente interagindo com objetos de tela (como `canvas`, botões, seletores, e interfaces da área `.controls` etc.).

## Componentes visuais

### Slide

- Fundo branco.
- Borda fina e suave.
- Sombra grande, difusa e elegante.
- Sem perspectiva 3D na estrutura base do slide.

### Título

- Grande, com impacto visual.
- Gradiente do azul-escuro para indigo.
- Deve abrir a leitura do slide com clareza imediata.
- Pode ser compactado ou reorganizado em slides densos.

### Texto corrido

- Cor secundária (`--text-secondary`).
- Blocos curtos.
- Ênfase por `strong` com cor de acento.

### Highlight box

Características obrigatórias:

- fundo com glow translúcido do acento;
- borda sutil;
- borda esquerda mais forte;
- cantos arredondados;
- possível shimmer discreto.

Função:

- destacar definição, observação importante ou insight-chave.

### Área visual e dinâmica

- Deve ficar dentro de um container elegante, claro e com borda leve.
- Pode usar `aspect-ratio`, desde que isso não faça o componente ultrapassar o slide.
- Pode ter animação de flutuação muito suave.
- Deve parecer um objeto demonstrativo, não um widget de produtividade.
- Se a arte for mais textual ou descritiva, o container pode ser mais compacto.

## Movimento e animação

O projeto já usa animações suaves e progressivas. Novas animações devem seguir esta linha.

Padrões permitidos:

- entrada com `fadeInUp`;
- entrada lateral com `fadeInRight`;
- flutuação lenta;
- shimmer ocasional e sutil;
- parallax leve em objetos internos;
- transições macias com easing não agressivo.

Restrições:

- não usar bounce, elastic exagerado, spin, zoom brusco ou animações chamativas;
- não mover o slide inteiro em 3D;
- não usar animações contínuas que prejudiquem leitura;
- toda animação deve parecer calma, refinada e intencional.

## Comportamento interativo

- A navegação deve ser simples, preferencialmente por teclado.
- O slide ativo é revelado por opacidade e visibilidade.
- Objetos internos podem reagir ao mouse de forma sutil.
- Canvas e elementos gráficos devem responder bem a resize.
- Efeitos visuais devem preservar nitidez, inclusive com `devicePixelRatio`.

## Canvas e ilustrações algorítmicas

Ao desenhar grafos, algoritmos ou estruturas:

- usar linhas finas e translúcidas;
- destacar estados ativos com indigo;
- usar verde como indicador de percurso, progresso ou agente móvel;
- manter poucos elementos e boa separação espacial;
- aplicar glow apenas nos pontos de maior importância;
- priorizar estabilidade visual sobre agitação.

O comportamento deve comunicar lógica e fluxo, não espetáculo.

## O que fazer ao criar novos slides

- Reutilizar a paleta atual.
- Reutilizar `Outfit`.
- Manter a estrutura centralizada e espaçosa.
- Preferir uma mensagem principal por slide.
- Combinar explicação textual com um objeto visual demonstrativo.
- Usar destaque visual apenas em pontos realmente importantes.
- Quando um slide ficar denso demais, ajustar a composição antes de aceitar qualquer vazamento visual.

## O que evitar

- fundos escuros como padrão;
- excesso de cores concorrendo entre si;
- cards demais dentro do slide;
- grids densos sem necessidade;
- sombras pesadas e escuras demais;
- bordas fortes demais;
- visual “tech neon”;
- aparência de dashboard SaaS;
- excesso de glassmorphism;
- animações rápidas ou agressivas;
- tipografia genérica que substitua `Outfit` sem motivo;
- aceitar overflow como solução visual.

## Regras para um agente de código

Ao editar este repositório, siga estas instruções:

1. Antes de criar novos estilos, tente reutilizar variáveis e padrões já presentes em `style.css`.
2. Se precisar introduzir uma nova cor, ela deve harmonizar com a base clara, slate, indigo e emerald já existente.
3. Novos componentes devem parecer parte da mesma apresentação, não de outro produto.
4. Sempre preserve legibilidade em fundo claro.
5. Se adicionar animação, use baixa intensidade e função clara.
6. Se adicionar elemento visual interativo, mantenha o comportamento suave e didático.
7. Se um componente não couber, adapte layout, hierarquia ou dimensões antes de considerar clipping ou vazamento.
8. Não mude a direção estética do projeto sem solicitação explícita.

## Checklist rápido

Antes de concluir uma alteração visual, valide:

- o slide continua claro e arejado;
- o indigo segue como cor principal;
- a tipografia continua baseada em `Outfit`;
- o conteúdo continua fácil de ler à distância;
- a animação está sutil;
- o componente novo combina com o restante do projeto;
- nenhum bloco está escapando do container principal;
- nada ganhou aparência genérica de template ou dashboard.
