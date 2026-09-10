# Frontend deste projeto: arquitetura, cores e botões

Documento único do CSS. Substitui `BOOTSTRAP-NO-PROJETO.md`, `SASS-BOOTSTRAP.md`,
`SASS-ORGANIZACAO-PASTAS.md` e `SASS-USO-DIARIO.md`, que foram apagados.

Estado verificado em 10/09/2026: Laravel 13 + Inertia + React 19 + **Bootstrap
5.3.8 compilado do fonte Sass pelo CLI do Dart Sass** (`sass` 1.x), com o Vite 8
cuidando só do JavaScript. Servido pelo Herd em `http://login-crm.test`.

---

# PARTE 1 — Arquitetura

## O caminho de um clique até a tela

```
navegador  GET /login
    │
    ▼
routes/web.php ──► AuthenticatedSessionController@create
    │
    ▼
Inertia::render('Auth/Login')          ← escolhe a PÁGINA pelo nome
    │
    ├─ 1ª visita: devolve o HTML de resources/views/app.blade.php
    │             com os dados embutidos em <div id="app" data-page="...">
    │
    └─ navegações seguintes: devolve só JSON (sem reload)
    │
    ▼
resources/js/app.jsx  ──► resolvePageComponent('./pages/Auth/Login.jsx')
    │
    ▼
React renderiza dentro da <div> do blade
```

O Laravel nunca manda HTML de página — manda o **nome** do componente. Quem
monta a tela é o React.

## O caminho do CSS até o `<head>`

Este projeto usa o **Sass CLI**: quem compila o `.scss` é o binário do Dart Sass,
chamado por um script do `package.json`. O Vite não encosta no nosso CSS.

```
1. package.json         "bootstrap": "^5.3.8", "sass": "^1.104.0"
                             ↓ npm install
2. node_modules/bootstrap/scss/     ← o FONTE, não o .min.css pronto
                             ↓ @import (com --load-path=node_modules)
3. resources/scss/app.scss          variáveis → bootstrap → nosso tema
                             ↓ npm run sass
4. public/css/app.css               ← ARTEFATO GERADO. Não edite, não commite.
                             ↓ <link>
5. resources/views/app.blade.php    <link href="{{ asset('css/app.css') }}?v=...">
                             ↓
                        o navegador baixa /css/app.css
```

As **duas pastas** do fluxo são `resources/scss/` (fonte, versionada) e
`public/css/` (saída, gerada e no `.gitignore`).

### O que ainda passa pelo Vite

Uma exceção deliberada: `bootstrap-icons` e `@fontsource/poppins` continuam
sendo importados no `resources/js/app.jsx`.

O motivo é concreto: o CSS desses pacotes aponta para arquivos `.woff2` com
caminho relativo. Quem reescreve essas URLs e copia as fontes para
`public/build/` é o bundler. Se você mudasse esses imports para dentro do Sass,
o `@import 'algo.css'` **não seria inlinado** — o Sass repassa `.css` como
`@import` literal — e o navegador iria procurar as fontes num caminho que não
existe.

Resultado: a página carrega **duas** folhas de estilo, e isso é esperado.

| Folha | Quem gera | O que tem dentro |
|---|---|---|
| `/css/app.css` | Sass CLI | Bootstrap recompilado + nosso tema |
| `/build/assets/app-*.css` | Vite | ícones `bi-*` e os `@font-face` do Poppins |

No `app.blade.php` o `<link>` do nosso CSS vem **depois** do `@vite`, para
vencer qualquer empate.

### O preço do mundo CLI (e como o projeto paga)

| Perda | Como está resolvido aqui |
|---|---|
| Sem hash no nome do arquivo → navegador serve CSS velho | `?v={{ filemtime(...) }}` no `<link>`: muda sozinho a cada recompilação |
| Sem HMR: o CSS não troca sem reload | `refresh: [...refreshPaths, 'public/css/app.css']` no `vite.config.js` recarrega a página quando o arquivo muda |
| Dois processos para rodar | `npm run dev` sobe os dois juntos via `concurrently` |
| Nada de tree-shaking do CSS | por enquanto irrelevante; o dia que importar, é trocar o `@import` do Bootstrap inteiro por uma lista de componentes |

**Regra que continua valendo:** `resources/scss/` contém `.scss` e nada mais, e
`public/css/` contém só o gerado. Foi por confundir isso que um File Watcher do
JetBrains (`.idea/watcherTasks.xml`, hoje desativado) cuspia um `app.css` de erro
dentro de `resources/`.

## Mapa das pastas

```
resources/
├── scss/                 ← FONTE. Só .scss aqui dentro.
│   ├── app.scss          ← ÚNICO arquivo sem "_": é a entrada do compilador
│   └── _login.scss       ← partial: só existe para ser importado
├── js/
│   ├── app.jsx           ← entrypoint do Vite: ícones, fonte e o Inertia
│   └── pages/            ← uma tela = um arquivo (o nome vem do Inertia::render)
│       ├── Auth/Login.jsx
│       ├── Auth/Register.jsx
│       └── Dashboard.jsx
└── views/
    └── app.blade.php     ← o único HTML do projeto

public/
├── css/app.css           ← SAÍDA do Sass CLI. Gerado, gitignorado.
└── build/                ← SAÍDA do Vite (JS + CSS de vendor). Gerado, gitignorado.
```

## O que NÃO está carregado

| | Situação |
|---|---|
| CSS do Bootstrap | carregado, **recompilado** com as nossas variáveis |
| Ícones (`bi-*`) | carregados — pacote separado `bootstrap-icons`, importado no `app.jsx` |
| **JS do Bootstrap** | **não carregado** |

Sem o JS, **modal, dropdown, collapse, tooltip, toast e offcanvas não
funcionam**. Em projeto React o caminho não é importar `bootstrap.bundle.min.js`
(ele mexe no DOM por fora e briga com o React) e sim usar `react-bootstrap`.

---

# PARTE 2 — O `app.scss` e a lei da ordem

O arquivo tem três blocos, e cada fronteira existe por um motivo **diferente**:

```scss
// 1. NOSSAS VARIÁVEIS
$primary: #13b497;
// ...

// 2. O BOOTSTRAP, compilado do fonte já com os valores acima
@import 'bootstrap/scss/bootstrap';

// 3. NOSSO TEMA por último
@import 'login';
```

| Fronteira | Mecanismo | Se inverter |
|---|---|---|
| 1 antes de 2 | `!default` (compilação) | o Bootstrap continua azul |
| 3 depois de 2 | cascata (navegador) + acesso às variáveis dele | `Undefined variable: $black` |

## O `!default`, que é a chave de tudo

Abra `node_modules/bootstrap/scss/_variables.scss`:

```scss
$primary: $blue !default;
```

`!default` significa **"use este valor só se a variável ainda não tiver um"**.
Definindo antes, você ganha — e o ganho não é uma cor, é a **cadeia de
derivação**: `$component-active-bg: $primary`, daí
`$input-focus-border-color: tint-color($component-active-bg, 50%)`,
`$link-color`, `.text-primary`, `.border-primary`, `.form-check-input:checked`…
Uma linha e o framework inteiro muda.

> **Por que `@import` e não `@use`:** o Bootstrap 5.3 é feito de 40 `@import` e
> zero `@use`. Por isso `@use 'bootstrap' with (...)` **não funciona** aqui, e
> por isso o `sass` está pinado em `^1` (o Dart Sass 2.x remove o `@import`).
> As duas flags que calam os avisos disso estão no script `sass` do
> `package.json`: `--quiet-deps` (avisos vindos do `node_modules`) e
> `--silence-deprecation=import` (as nossas duas linhas de `@import`).

> **Por que `--load-path=node_modules`:** o CLI não sabe resolver
> `bootstrap/scss/bootstrap` sozinho — isso é coisa de bundler. A flag diz ao
> Sass onde procurar. Sem ela: `Error: Can't find stylesheet to import`.

---

# PARTE 3 — Fluxo: alterar cores

## A decisão, em três níveis

Antes de escrever CSS, faça as perguntas **nesta ordem**:

| Nível | Pergunta | Onde mexe | Exemplo |
|---|---|---|---|
| 1 | Existe variável Sass do Bootstrap? | bloco 1 do `app.scss` | `$primary: #13b497` |
| 2 | Existe classe pronta? | no `.jsx` | `text-muted`, `bg-white`, `btn-primary` |
| 3 | Só então: é coisa nossa? | `_login.scss` (bloco 3) | `.login-panel-dark` |

Escrever CSS para algo que o Bootstrap já gera é o erro clássico — foi o que
este projeto fazia com `.login-input:focus`, que existia só para desfazer o azul.

## Passo a passo: trocar a cor da marca

1. Abra `resources/scss/app.scss`, bloco 1.
2. `$primary: #13b497;` → o valor novo.
3. Com `npm run dev` rodando, salve. Botão, link, foco de input, `.text-primary`,
   `.border-primary` e checkbox marcado mudam juntos.

Nada mais. Se você precisou tocar em `_login.scss` para trocar uma cor de
componente do Bootstrap, provavelmente havia uma variável.

## Sobrescreva no TOPO da cadeia, não no meio

Bug real deste arquivo, e o pior tipo porque **não gera erro**: havia
`$input-btn-focus-width: .2rem`, e o CSS saía com `.25rem`. A cadeia é:

```
$focus-ring-width: .25rem !default
   └─> $focus-ring-box-shadow: 0 0 $focus-ring-blur $focus-ring-width ...
          └─> $input-btn-focus-box-shadow: $focus-ring-box-shadow !default
                 └─> $input-focus-box-shadow: ...
                        └─> .form-control:focus { box-shadow: ... }
```

Quando o Sass monta `$focus-ring-box-shadow`, o `.25rem` já foi **congelado lá
dentro**; `$input-btn-focus-width` não participa mais. A correção foi definir
`$focus-ring-width: .2rem`.

**Regra: se a variável que você definiu aparece do lado direito de outra
variável, suba e sobrescreva a de cima.**

## O caso do texto branco no botão

Trocar `.login-btn` por `.btn-primary` fez o texto nascer **preto**. Não é bug: o
`color-contrast()` do Bootstrap mede o fundo e escolhe.

| Sobre o verde `#13b497` | Contraste |
|---|---|
| texto branco | ~2,6:1 — reprova no padrão `$min-contrast-ratio: 4.5` |
| texto preto | ~8:1 — aprova |

A decisão do projeto foi manter o branco da identidade visual, baixando o
mínimo no bloco 1:

```scss
$min-contrast-ratio: 2.5;
```

Efeito colateral bom: com texto claro o Bootstrap volta a **escurecer** o fundo
no hover (`#109980`, quase o `#0f9c82` do CSS antigo) em vez de clarear.

O caminho tecnicamente mais correto seria escurecer o `$primary` até o branco
passar em 4,5:1 — fica registrado como dívida de acessibilidade.

## Como achar a variável sozinho

A doc do site lista poucas. **A documentação real é o fonte**, e todo nome tem
prefixo previsível:

```powershell
Select-String -Path node_modules/bootstrap/scss/_variables.scss -Pattern '^\$btn-'
Select-String -Path node_modules/bootstrap/scss/_variables.scss -Pattern '^\$navbar-'
Select-String -Path node_modules/bootstrap/scss/_variables.scss -Pattern '^\$enable-'
```

O terceiro é o mais divertido: `$enable-shadows`, `$enable-gradients`,
`$enable-rounded` são chaves liga/desliga do framework inteiro.

Do CSS gerado de volta para a variável, quando algo não obedeceu:

```powershell
Select-String -Path node_modules/bootstrap/scss/forms/_form-control.scss -Pattern 'box-shadow'
```

---

# PARTE 4 — Fluxo: mexer em botões

## Anatomia: o `.btn` do 5.3 é feito de CSS variables

```css
.btn-primary{
  --bs-btn-color:#fff;            --bs-btn-bg:#13b497;
  --bs-btn-hover-color:#fff;      --bs-btn-hover-bg:#109980;
  --bs-btn-active-bg:#0f9079;     --bs-btn-disabled-bg:#13b497;
  --bs-btn-border-color:#13b497;  --bs-btn-focus-shadow-rgb:54,191,167;
}
```

Todas essas foram **calculadas** a partir do `$primary`. É por isso que mexer em
`background-color` na mão é o caminho errado: você muda um estado e quebra os
outros cinco. Era o defeito do `.login-btn` antigo, que precisava repetir
`color: #fff` no `:hover` porque o `.btn` redefinia lá.

## Nível 2 — usar o que existe

```jsx
<button className="btn btn-primary">Entrar</button>       {/* sólido */}
<button className="btn btn-outline-primary">Cancelar</button>
<button className="btn btn-link">Esqueci a senha</button>
<button className="btn btn-primary btn-sm">Editar</button>  {/* btn-sm | btn-lg */}
<button className="btn btn-primary w-100">Entrar</button>   {/* largura total */}
```

Com ícone e estado de envio (o padrão usado nas telas de auth):

```jsx
<button type="submit" className="btn btn-primary" disabled={processing}>
    <i className="bi bi-door-open me-1"></i>
    {processing ? 'Entrando…' : 'Entrar'}
</button>
```

O `processing` vem do `useForm` do Inertia e evita duplo envio. O `.btn:disabled`
já tem o visual pronto — não escreva CSS para isso.

## Nível 1 — ajustar TODOS os botões

Bloco 1 do `app.scss`. As variáveis existem para praticamente tudo:

```scss
$btn-padding-y:      .5rem;
$btn-padding-x:      1rem;
$btn-font-weight:    600;
$btn-border-radius:  $border-radius;
$btn-disabled-opacity: .5;
```

## Criar uma cor de botão nova (`btn-marca`)

Adicionar ao mapa `$theme-colors` gera a família inteira de uma vez —
`.btn-marca`, `.btn-outline-marca`, `.text-marca`, `.bg-marca`, `.border-marca`:

```scss
// bloco 1, DEPOIS das variáveis e ANTES do @import do bootstrap
$custom-colors: ("marca": #232323);
$theme-colors: map-merge($theme-colors, $custom-colors);
```

Isso exige que `$theme-colors` já exista — ou seja, importar antes só as
funções/variáveis do Bootstrap. Enquanto o projeto tiver duas ou três cores,
prefira o caminho simples: uma classe própria no `_login.scss` usando as
variáveis do próprio botão.

```scss
.btn-marca {
    --bs-btn-color: #fff;
    --bs-btn-bg: #232323;
    --bs-btn-hover-bg: #{shade-color(#232323, 15%)};
}
```

Repare: setar as `--bs-btn-*` em vez de `background-color` mantém hover, foco,
active e disabled coerentes de graça.

---

# PARTE 5 — Fluxo: estilizar uma tela nova

1. **Monte com classe do Bootstrap primeiro.** O `Dashboard.jsx` hoje é 100%
   Bootstrap (`navbar`, `container`, `py-3`) e não tem uma linha de CSS próprio.
2. **Precisou de algo que o framework não tem?** Crie o partial:

   ```powershell
   New-Item resources/scss/_dashboard.scss
   ```

3. **Importe no fim do `app.scss`**, depois do Bootstrap:

   ```scss
   @import 'bootstrap/scss/bootstrap';

   @import 'login';
   @import 'dashboard';
   ```

4. **Prefixe as classes com o nome da tela** (`.dashboard-sidebar`), para não
   colidir com o Bootstrap nem com outra tela.

Convenções: o `_` marca um **partial** (o Sass nunca gera um `.css` avulso dele);
no `@import` você omite o `_` **e** a extensão.

## Sass que você vai usar de verdade

**Aninhamento com `&`** — o `&` é substituição **literal de texto**, não "o pai".
Por isso `&-link` vira `.login-link`, e não `.login .login-link`:

```scss
.login {
    &-link {
        color: $primary;
        &:hover { text-decoration: underline; }
    }
}
```

Máximo 3 níveis: cada nível vira especificidade que você vai ter que vencer
depois.

**Contas e funções de cor**, em vez de hex mágico:

```scss
border-radius: $border-radius * 2;              // .92rem
background-color: shade-color($primary, 20%);   // mistura com preto
color: tint-color($primary, 50%);               // mistura com branco
box-shadow: 0 8px 16px rgba($black, .15);
```

`darken()`/`lighten()` estão depreciadas. Fora do Bootstrap, use `color.adjust()`.

**Mixin** = bloco reutilizável com parâmetros:

```scss
@mixin center($direction: row) {
    display: flex;
    flex-direction: $direction;
    align-items: center;
    justify-content: center;
}

.login-bg { @include center; }
```

**Map + `@each`** = gerar variações sem repetir:

```scss
$status: ("ativo": #13b497, "pendente": #f7b84b, "inativo": #878a99);

@each $nome, $cor in $status {
    .badge-#{$nome} { background-color: $cor; }   // #{} = interpolação
}
```

---

# PARTE 6 — Achar qualquer classe do Bootstrap

## Componentes vs utilitários

| | Componente | Utilitário |
|---|---|---|
| O que é | bloco pronto, várias propriedades | **uma** propriedade CSS |
| Exemplos | `btn`, `form-control`, `card`, `navbar` | `d-flex`, `mb-3`, `text-white` |
| Onde documenta | seções **Forms** e **Components** | seção **Utilities** |

## A fórmula do espaçamento

`{propriedade}{lados}-{breakpoint}-{tamanho}`

- **propriedade** — `m` margin · `p` padding
- **lados** — `t` top · `b` bottom · `s` start · `e` end · `x` horizontal ·
  `y` vertical · *nada* = os quatro
- **tamanho** — `0`=0 · `1`=.25rem · `2`=.5rem · `3`=1rem · `4`=1.5rem ·
  `5`=3rem · `auto`

Assim você lê sem consultar: `me-1` é `margin-right:.25rem`, `pe-5` é
`padding-right:3rem`, `px-3` é padding esquerda **e** direita de 1rem.

## O infixo de breakpoint

Vale para quase todo utilitário e para o grid. `col-md-6` = "6 de 12 colunas **a
partir de** 768px"; abaixo disso ocupa a linha inteira.

| Infixo | A partir de |
|---|---|
| *(nenhum)* | 0 |
| `sm` | 576px |
| `md` | 768px |
| `lg` | 992px |
| `xl` | 1200px |
| `xxl` | 1400px |

Exemplos: `d-none d-md-block` (some no celular), `text-md-end`.

## O caminho inverso (o mais útil)

F12 → clique no elemento → painel **Styles**: mostra qual classe gerou cada
propriedade e de qual arquivo veio. É assim que se descobre por que o Bootstrap
está vencendo o seu CSS.

`Ctrl+K` na doc oficial busca por nome de classe **e** por propriedade CSS.
Quase toda página de componente tem uma seção **CSS variables** no fim — é a
lista de `--bs-*` que aquele componente lê.

## O que as telas de auth usam hoje

| Família | Classes |
|---|---|
| Grid | `row` `col-md-6` `col-lg-6` `g-0` |
| Formulário | `form-control` `form-label` `form-check` `form-check-input` `form-check-label` |
| Validação | `is-invalid` `invalid-feedback` (trabalham em par: a mensagem só aparece se houver um `.is-invalid` irmão antes) |
| Botão | `btn` `btn-primary` |
| Flex | `d-flex` `flex-column` `justify-content-center` `justify-content-between` `align-items-center` |
| Espaçamento | `p-3` `px-3` `pe-5` `m-0` `mb-*` `mt-*` `me-1` |
| Tamanho | `w-100` `min-vh-100` |
| Posição | `position-relative` `position-absolute` `top-50` `end-0` `translate-middle-y` |
| Cor / fundo | `text-white` `text-light` `text-danger` `text-secondary` `bg-white` `bg-transparent` |
| Ícones (pacote separado) | `bi bi-eye` `bi-eye-slash` `bi-key` `bi-file-person` `bi-door-open` |
| Nossas (`_login.scss`) | `login-bg` `login-card` `login-panel-dark` `login-panel-form` `login-subtitle` `login-frase` `login-link` `login-version` `login-logo` `login-brand` |

> **Nota de leitura:** um `grep className="..."` não acha tudo. Os inputs usam
> template literal — ``className={`form-control ${errors.email ? 'is-invalid' : ''}`}``
> — então procure por `` className={` `` também.

---

# PARTE 7 — Verificar, e quando algo dá errado

## Comandos

```powershell
npm run dev         # sobe os DOIS: sass --watch e o servidor do Vite
npm run build       # compila o Sass e depois builda o JS — nesta ordem
npm run sass        # só o CSS, uma vez (--style=compressed)
npm run sass:watch  # só o CSS, ficando de olho nos arquivos
```

O `dev` usa o `concurrently`, que rotula a saída dos dois processos
(`[sass]` e `[vite]`) e derruba os dois juntos no `Ctrl+C`.

Nunca `composer dev`: ele sobe um `php artisan serve` em cima do Herd.

O que cada script faz por trás:

```
sass resources/scss/app.scss public/css/app.css
     --load-path=node_modules          # onde achar 'bootstrap/scss/...'
     --quiet-deps                      # cala avisos do node_modules
     --silence-deprecation=import      # cala o aviso do nosso @import
     --style=compressed --no-source-map
```

## A prova de que o Bootstrap foi recompilado (e não sobrescrito)

```powershell
npm run sass
Select-String -Path public/css/app.css -Pattern "--bs-primary: #13b497"
```

Se aparecer, o framework saiu do forno já verde. Se o foco do input estiver
**azul**, o bloco 1 caiu depois do `@import`.

E a prova de que o navegador está recebendo o arquivo certo:

```powershell
curl.exe -I http://login-crm.test/css/app.css     # tem que dar 200 e text/css
```

Para ler o erro cru do Sass sem os scripts no caminho:

```powershell
npx sass --load-path=node_modules resources/scss/app.scss temp.css
```

## Armadilhas

| Sintoma | Causa |
|---|---|
| `Undefined variable: $black` | Partial seu importado **antes** do Bootstrap. |
| Bootstrap continua azul | Suas variáveis caíram **depois** do `@import`. O `!default` já venceu. |
| Sua classe não vence o Bootstrap | Partial importado antes dele: mesma especificidade, quem vem depois ganha. |
| Definiu a variável e o CSS ignorou | Sobrescreveu no **meio** de uma cadeia de derivação. Suba até a origem. |
| Classe some do CSS mas continua no JSX | Apagou do partial e esqueceu do `className`. Botão sem cor nenhuma. |
| Um `.css` aparece em `resources/scss/` | Alguma ferramenta compila Sass por fora (File Watcher do IDE). A saída é `public/css/`. |
| Mudou o `.scss` e nada acontece | O `sass:watch` não estava rodando — `npm run dev` sobe os dois, `vite` sozinho não. |
| A página ficou **sem estilo nenhum** | `public/css/app.css` não existe: rode `npm run sass`. É o preço de a saída ser gitignorada — em máquina nova, ou depois de um `git clean`, tem que gerar. |
| Estilo velho mesmo depois de salvar | Cache do navegador. Confira se o `?v=` no `<link>` mudou; se não mudou, o arquivo não foi recompilado. |
| `Can't find stylesheet to import` | Faltou `--load-path=node_modules` no comando do Sass. |
| `@import 'algo.css'` não inlina | Sass repassa `.css` como `@import` literal. CSS pronto de terceiros entra pelo `app.jsx`. |
| `ViteException: Unable to locate file in Vite manifest` | Falta rodar `npm run build` (ou `npm run dev`) — isso é do **JS**, não do CSS. |

---

# PARTE 8 — Quando o CSS crescer

Com dois partials, o arquivo único está certo. Quando o `app.scss` passar de
~150 linhas, o padrão de mercado é o **7-1** (7 pastas + 1 entrada), aqui já
podado para o que este projeto usaria:

```
resources/scss/
├── app.scss           ← só @use, define a ordem da cascata
├── abstracts/         ← variáveis, mixins, API do Bootstrap. ZERO CSS de saída
├── vendor/            ← _bootstrap.scss: o único lugar com @import
├── base/              ← tags soltas (body, a, h1)
├── layout/            ← navbar, sidebar, o shell das telas de auth
├── components/        ← peças reutilizáveis
└── pages/             ← estilo que só existe em UMA tela
```

Regra para escolher a pasta: *não gera CSS?* `abstracts/`. *É de terceiro?*
`vendor/`. *Aplica em tag sem classe?* `base/`. *É esqueleto de tela?* `layout/`.
*Aparece em mais de um lugar?* `components/`. *Só nessa tela?* `pages/`.
Na dúvida entre os dois últimos, comece em `pages/`.

O que muda na migração: `@import` (global, duplica se importar duas vezes) dá
lugar a **`@use`** (escopo por arquivo, compila uma vez só) e **`@forward`**
(arquivo-índice `_index.scss` que reexporta a pasta). Duas regras que pegam:
todo `@use` fica no topo do arquivo, e o que um arquivo `@use` **não vaza** para
quem o usa — cada partial declara os seus.

O `@import` sobrevive isolado em `vendor/_bootstrap.scss`, porque o Bootstrap 5.3
ainda não migrou. Quando o 6 sair, troca-se um arquivo só.

Migre em dois tempos: primeiro **mover** o conteúdo sem refatorar e conferir que
a tela ficou idêntica; só depois refatorar. Isso evita depurar duas coisas ao
mesmo tempo.

---

## Resumo dos arquivos

| Arquivo | Papel |
|---|---|
| `resources/scss/app.scss` | Entrada do compilador. Os três blocos, nesta ordem. |
| `resources/scss/_login.scss` | Tema das telas de auth. Só o que o Bootstrap não gera. |
| `package.json` | Os scripts `sass`, `sass:watch`, `dev` e `build`. É aqui que mora o caminho fonte → saída. |
| `public/css/app.css` | **Saída do Sass CLI.** Gerada, gitignorada. Não edite, não commite. |
| `resources/views/app.blade.php` | O único HTML. `@vite(...)` para o JS + o `<link>` do nosso CSS. |
| `resources/js/app.jsx` | Importa só ícones e Poppins (CSS de vendor); monta o Inertia. |
| `resources/js/pages/**` | Uma tela por arquivo. Usam `btn-primary`/`form-control` puros. |
| `vite.config.js` | `input` só com o `.jsx`; `refresh` de olho no CSS gerado. |
| `public/build/**` | Saída do Vite (JS + CSS de vendor). Gerada, gitignorada. |
| `.ai/rules/css.md` | As regras acima, em formato que os agentes leem. |

## Documentos relacionados

- [criando-uma-pagina.md](criando-uma-pagina.md) — rota → controller → página React.
- [AUTENTICACAO-BACKEND.md](AUTENTICACAO-BACKEND.md) — sessão, middleware `auth`.
- [CRUD-CLIENTES.md](CRUD-CLIENTES.md) — aula prática usando tudo isto.
- [DOCKER-MYSQL.md](DOCKER-MYSQL.md) — o banco.
