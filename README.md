# Órbita

[![CI](https://github.com/CleiverCoelho/orbita/actions/workflows/ci.yml/badge.svg)](https://github.com/CleiverCoelho/orbita/actions/workflows/ci.yml)
[![Deploy](https://github.com/CleiverCoelho/orbita/actions/workflows/deploy.yml/badge.svg)](https://github.com/CleiverCoelho/orbita/actions/workflows/deploy.yml)

Seus hábitos em sistema solar. Cada hábito vira um planeta em 3D que orbita um sol; quanto maior a sequência de dias cumpridos, maior e mais brilhante o planeta fica.

**Produção:** https://CleiverCoelho.github.io/orbita/

## Integrante

- Cleiver Coelho Florenzano

## Sobre o sistema

O Órbita é um rastreador de hábitos com uma interface de planetário. A cena central é um sistema solar interativo em 3D: dá para girar a câmera, aproximar e clicar nos planetas.

Funcionalidades:

- **Criar planetas**: cada hábito tem nome, cor, tipo de superfície (rochoso, gasoso, gelo ou lava) e meta de dias por semana. Nomes vazios, longos demais ou repetidos são recusados com mensagens claras.
- **Check-in diário**: um toque marca o hábito como feito hoje; os últimos 7 dias aparecem ao lado de cada hábito.
- **Planetas que evoluem**: a sequência atual define o tamanho do planeta e o seu nível (Poeira cósmica, Asteroide, Lua, Planeta, Gigante gasoso, Estrela). Sequências de duas semanas ganham anéis e cada semana de recorde ganha uma lua.
- **Painel de detalhes** com efeito 3D de inclinação: sequência atual, recorde, taxa dos últimos 30 dias, progresso da semana e um calendário de duas semanas para corrigir dias anteriores.
- **Renomear e remover** planetas, com confirmação antes de apagar.
- **Busca** por nome, **resumo do dia** e "energia solar" acumulada; o sol pulsa mais forte quando todos os hábitos do dia foram cumpridos.
- **Backup**: exportação e importação em JSON, com validação do arquivo.
- **Sistema de exemplo** para conhecer o app sem precisar cadastrar nada.
- Os dados ficam no `localStorage` do navegador. Em navegadores sem WebGL, um planetário em CSS 3D substitui a cena.
- Interface responsiva, navegável por teclado (Esc fecha os detalhes) e com suporte a `prefers-reduced-motion`.

## Tecnologias

- **React 19 + TypeScript**: interface em componentes com tipagem estrita.
- **Vite**: servidor de desenvolvimento e build de produção.
- **Three.js, React Three Fiber e Drei**: renderização do sistema solar em WebGL (luzes, materiais por tipo de planeta, estrelas e controles de câmera).
- **CSS moderno**: glassmorphism com `backdrop-filter`, `color-mix`, transformações 3D com `perspective` e fontes self-hosted via Fontsource (Instrument Serif e Space Grotesk).
- **Vitest + Testing Library + jsdom**: testes de unidade e de componentes.
- **@vitest/coverage-v8**: medição de cobertura, com limite mínimo de 80% configurado em `vite.config.ts`.
- **Playwright**: testes end-to-end no Chromium.
- **GitHub Actions**: CI em Linux, macOS e Windows a cada commit, e deploy automático no GitHub Pages quando o CI passa na `main`.

Arquitetura: toda a regra de negócio fica em `src/domain` (funções puras de datas, hábitos, sequências, estatísticas, órbitas, persistência e reducer). Os componentes React em `src/components` só exibem dados e disparam ações, e `src/scene` contém a cena 3D. Isso deixa a lógica fácil de testar sem navegador.

## Uso de IA

- **Claude (Anthropic)**: usado como assistente de programação para propor a ideia do sistema, a arquitetura em camadas, o design visual, o código da cena 3D, os testes de unidade e e2e, os workflows do GitHub Actions e este README.
- O autor revisou o código gerado, rodou os testes localmente, ajustou textos e conferiu o visual em desktop e celular.
- A IA foi útil principalmente para acelerar a parte repetitiva (casos de teste, configuração de CI) e para explorar a API do React Three Fiber. Os testes funcionaram como rede de segurança para validar o que foi gerado.

## Execução dos testes

Pré-requisito: Node.js 22 ou superior.

```bash
npm ci
```

Testes de unidade e de componentes:

```bash
npm test
```

Testes com relatório de cobertura (texto no terminal e HTML em `coverage/index.html`):

```bash
npm run test:coverage
```

Testes end-to-end (o Playwright gera o build e sobe o servidor sozinho):

```bash
npx playwright install chromium
npm run test:e2e
```

Rodar o app localmente:

```bash
npm run dev
```

### Números atuais

- 110 testes de unidade e de componentes em 16 arquivos
- 7 testes end-to-end
- Cobertura acima de 98% de linhas e 97% de branches

A pasta `src/scene` (código WebGL) e `src/main.tsx` ficam fora do cálculo de cobertura porque o jsdom não tem WebGL; esse código é exercitado pelos testes end-to-end no navegador real.
