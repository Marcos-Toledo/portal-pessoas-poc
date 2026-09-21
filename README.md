# Portal Pessoas — POC de Arquitetura de Microfrontends

POC da arquitetura proposta para a modernização do Portal Pessoas:
**Shell Application + Microfrontends federados em runtime (Plugin Registry) +
convivência com legado via Strangler Fig + pacotes compartilhados em monorepo.**

## Requisitos

- Node.js >= 20
- pnpm 9 (`npm i -g pnpm@9`)

## Como executar

```bash
pnpm install
pnpm dev
```

Abra **http://localhost:5173**.

Isso sobe todos os processos via Turborepo:

| Porta | Processo            | Papel                                           |
| ----- | ------------------- | ----------------------------------------------- |
| 5173  | `apps/shell`        | Portal: layout, rotas, registry, busca, notif.  |
| 4000  | `apps/bff`          | BFF: manifest, feature flags, APIs mock         |
| 4001  | `apps/legacy`       | "Sistema legado" fake (férias, holerite)        |
| 5001  | `apps/mfe-ponto`    | Microfrontend de ponto (remote, squad A)        |
| 5002  | `apps/mfe-beneficios` | Microfrontend de benefícios (remote, squad B) |

Outros comandos: `pnpm build` (build de tudo), `pnpm typecheck`.

### Mobile

```bash
pnpm --filter @portal/mobile start   # Expo: teclas a (Android), i (iOS), w (web)
pnpm --filter @portal/mobile ios     # ou direto no simulador iOS
pnpm --filter @portal/mobile android # ou direto no emulador Android
pnpm --filter @portal/mobile web     # no navegador via react-native-web (:8081)
```

Requer o BFF de pé (`pnpm --filter @portal/bff dev`) e, para as jornadas
legadas, o `apps/legacy` (`pnpm --filter @portal/legacy dev`). Android
precisa de `ANDROID_HOME`/`platform-tools` no PATH e Expo Go compatível
com o SDK (Expo instala sozinho no emulador). iOS: **o Xcode 27 trocou o
`Simulator.app` pelo `DeviceHub.app`** — CLIs antigas do Expo falham com
"Can't determine id of Simulator app"; o projeto usa **SDK 57**, cuja CLI
já reconhece o DeviceHub.

O app navega de verdade: catálogo (mesmo manifest do web) → stack
navigator → jornadas `mfe` abrem telas nativas (`src/journeys/`) e
jornadas `legacy` abrem em WebView — mesmo papel do iframe no shell web.
Em produção, as jornadas nativas seriam bundles federados via **Re.Pack**
(Module Federation para RN) atualizados OTA, mantendo o deploy
independente por squad.

## O que a POC demonstra (mapeado ao case)

- **Shell desacoplado**: não importa código de nenhuma jornada. Descobre os
  MFEs em runtime consultando `/api/manifest` no BFF e registrando os remotes
  via `@module-federation/runtime` (`registerRemotes` + `loadRemote`).
- **Inclusão de jornada sem alterar o core**: adicionar uma jornada = nova
  entrada no manifest do BFF. Zero rebuild do shell.
- **Duas jornadas modernas** (`mfe-ponto`, `mfe-beneficios`) organizadas como
  apps independentes, cada uma com `dev`/`build`/`typecheck` próprios —
  simulando squads e pipelines separados. Cada uma também roda standalone.
- **Convivência com legado**: jornadas "férias" e "holerite" são servidas por
  um servidor separado (outra origem) e encapsuladas em `iframe` sandboxed,
  com ponte `postMessage` tipada e injeção de token SSO após `LEGACY_READY`.
- **Deploy/rollback independente**: o `entry` de cada remote vem do manifest —
  em produção apontaria para `/mfe-x/<versão>/remoteEntry.js` na CDN; rollback
  é trocar a entrada do manifest.
- **Contrato de montagem agnóstico**: MFEs expõem `mount(el, ctx)` em vez de
  componentes React — o shell não acopla no framework interno da jornada.
- **Comunicação desacoplada**: `@portal/core` expõe `TypedEventBus`
  (emitter tipado in-process, portável web/Hermes). Ex.: registrar ponto
  no MFE emite
  `notification:received`, que o sino do shell exibe — sem import cruzado.
- **Contexto injetado**: `MountContext` (user, token, featureFlags, telemetry,
  eventBus) é passado no mount — nada de singleton global de auth nos MFEs.
- **Design System em camadas**: `@portal/design-tokens` (tokens → CSS vars +
  TS) e `@portal/ui` (Button, Card, Badge, Spinner) compartilhados.
- **Cliente de API único**: `@portal/api-client` — MFEs nunca chamam `fetch`
  direto; auth, headers e base URL vivem num lugar só.
- **Feature flags**: o BFF pode desligar uma jornada (`jornada-<id>: false`)
  e ela some do portal sem deploy.
- **Observabilidade**: `@portal/core` telemetry envia logs estruturados ao
  BFF (`POST /api/telemetry`, visível no console do BFF).
- **Isolamento de falhas**: cada jornada renderiza dentro de um Error
  Boundary; falha de um remote mostra fallback sem derrubar o portal.
- **Busca global**: header consulta `/api/search` no BFF.
- **Mobile com navegação real**: catálogo do mesmo manifest, jornadas
  modernas como telas nativas (reuso de `api-client`/`core`/tokens) e
  legado em WebView.
- **CI por app**: `.github/workflows/ci.yml` — `turbo --affected` no
  verify; matrix de deploy que só publica o app afetado pelo diff
  (push compara `before...HEAD`; PR usa merge-base).

## Estrutura

```
apps/
  shell/            # Host: layout, rotas dinâmicas, registry, busca, notif.
  mfe-ponto/        # Remote (squad A): registro de ponto
  mfe-beneficios/   # Remote (squad B): benefícios
  legacy/           # Simula sistema legado em origem separada
  bff/              # BFF: manifest, flags, APIs mock, coleta de telemetria
  mobile/           # Shell mobile (Expo SDK 57): navegacao + dispatcher
                    #   screens/ = shell; journeys/ = jornadas nativas
packages/
  core/             # Contratos: manifest, MountContext, EventBus, telemetry
  design-tokens/    # Tokens (TS + CSS vars) + base.css (reset/fonte/fundo)
  ui/               # Componentes base compartilhados
  api-client/       # Cliente HTTP padronizado do BFF
```

## Decisões e trade-offs

- **Module Federation via Vite** (`@module-federation/vite` + runtime API) em
  vez de `nextjs-mf`: o plugin para Next.js não suporta App Router de forma
  confiável, e SSR não agrega num portal autenticado de intranet.
- **`mount()` contract** em vez de componente exposto: troca robustez de
  isolamento por um pouco de bundle extra; permite migrar um MFE de stack no
  futuro sem tocar no shell. `react` fica singleton no shared scope;
  `react-dom` fica **fora** — o proxy de dev do plugin resolvia
  `react-dom/client` para um chunk sem `__SECRET_INTERNALS` e quebrava o
  entry standalone dos MFEs. Cada remote embute seu react-dom (~140KB).
- **Registry no BFF** (não estático no shell): é o que viabiliza "adicionar
  jornada sem rebuild do core" e rollback por versão.
- **Iframe + origem separada para legado**: em produção o legado ficaria num
  subdomínio próprio — `allow-scripts` + `allow-same-origin` na mesma origem
  permitiria ao frame remover o próprio sandbox.
- **Remote auto-suficiente**: cada MFE importa `tokens.css` + `base.css`
  no `mount` — o CSS viaja no remoteEntry, então a jornada não depende de
  estilo do host e fica idêntica standalone (:5001/:5002) e federada.
- **Monorepo**: squads ganham contratos compartilhados e refactors atômicos;
  isolamento vem de pipelines por app + boundaries (em produção: ESLint
  `no-restricted-imports` entre MFEs, CODEOWNERS). Alternativa documentada:
  polyrepo publicando pacotes — troca DX por isolamento físico.

## Fora do escopo da POC (próximos passos reais)

- Mobile: o shell Expo já navega e consome os pacotes compartilhados; o
  próximo passo é Re.Pack para federação de verdade no app (fallback:
  pacotes compartilhados + EAS Update, com deploy coordenado).
- Testes: contract tests do contrato `mount`, E2E Playwright, visual
  regression no Storybook.
- Versionamento SemVer do manifest e dos contratos de eventos
  (JSON Schema/Zod em runtime).
- SSO real (OIDC), CSP, MDM, CDN interna, Sentry por MFE.
