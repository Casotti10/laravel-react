# Organizando o Sass em pastas

> Continuação de [SASS-BOOTSTRAP.md](SASS-BOOTSTRAP.md). Aquele documento instala o
> compilador, explica o `!default` e monta um `resources/css/app.scss` único.
> Este resolve a pergunta seguinte: **quando o arquivo único cresce, onde cada
> coisa mora?**

---

## Ponto de partida e destino

| Hoje (após SASS-BOOTSTRAP.md) | Depois deste documento |
|---|---|
| `resources/css/app.scss` — variáveis + `@import bootstrap` + tema | `resources/scss/app.scss` — 5 linhas de `@use` |
| `resources/css/_login.scss` — todo o tema | `abstracts/`, `vendor/`, `base/`, `layout/`, `components/`, `pages/` |
| `@import` em todo lugar | `@use`/`@forward`, com `@import` isolado em **um** arquivo |

A pasta muda de `css/` para `scss/` porque nada ali dentro é mais CSS.

---

## Instalação (resumo)

Se ainda não fez, é um comando:

```powershell
npm install -D "sass@^1"
```

O `^1` é proposital: o Dart Sass 2.x **remove** o `@import`, que o Bootstrap 5.3
ainda usa. Detalhes e justificativa em [SASS-BOOTSTRAP.md](SASS-BOOTSTRAP.md).

> Alternativa opcional: `npm install -D "sass-embedded@^1"` é o mesmo Dart Sass
> rodando como binário nativo — bem mais rápido, sintaxe idêntica, mesma linha
> 1.x. Se o binário der problema no Windows, volte para `sass`.

O Vite já sabe compilar `.scss`. Não há plugin, loader nem mudança no
`laravel-vite-plugin`.

---

## Por que sair do arquivo único

Não é organização por estética. São três problemas concretos:

1. **Achar.** Com 300 linhas num arquivo, "onde está a cor do badge?" vira `Ctrl+F`.
2. **Ordem da cascata.** Num arquivo só, a ordem é acidental — o que você digitou
   por último vence. Em pastas, a ordem é **declarada** no `app.scss` e visível.
3. **Escopo.** Com `@import` tudo cai num escopo global; um `$color` sobrescreve
   o outro em silêncio. Com `@use` cada arquivo declara o que precisa.

---

## As duas palavras que importam: `@use` e `@forward`

Esqueça `@import` para código **seu**. Ele está depreciado no Dart Sass (some na
2.0) e sempre teve dois defeitos: incluir o mesmo arquivo duas vezes duplicava o
CSS, e tudo vivia num escopo global gigante.

### `@use` — "eu preciso disto"

```scss
@use 'abstracts/variables';

.login-bg { background-color: variables.$brand-green; }
```

Por padrão cria um **namespace** com o nome do arquivo. Verboso, então:

```scss
@use 'abstracts/variables' as v;   // v.$brand-green
@use 'abstracts' as *;             // $brand-green  <- sem namespace
```

O `as *` é o que você vai usar quase sempre para `abstracts`.

Regras que pegam quem está começando:

- Todo `@use` fica **no topo do arquivo**, antes de qualquer regra CSS.
- O mesmo arquivo carregado por 10 partials é **compilado uma vez só**. Sem
  CSS duplicado — essa é a diferença central para o `@import`.
- O que um arquivo `@use` **não vaza** para quem o usa. Se `_login.scss` quer
  `$brand-green`, ele escreve o próprio `@use`, mesmo que o `app.scss` já tenha
  feito isso.

### `@forward` — "eu reexporto isto"

É o que faz o arquivo-índice funcionar:

```scss
// abstracts/_index.scss
@forward 'variables';
@forward 'mixins';
@forward 'bootstrap-api';
```

Agora `@use 'abstracts' as *` entrega os três de uma vez. `@forward` não gera
CSS e não dá acesso a quem escreveu — só repassa adiante.

### O underscore e o índice

- **`_nome.scss`** = *partial*: o Sass não gera um `.css` para ele. Todo arquivo
  da árvore é partial, menos o `app.scss`.
- Ao referenciar, omita o `_` e a extensão: `@use 'abstracts/variables'`.
- **`_index.scss`** dentro de uma pasta: `@use 'components'` encontra
  `components/_index.scss` automaticamente. É o que mantém o `app.scss` com 5
  linhas em vez de 30.

---

## A estrutura de pastas

O padrão de mercado é o **7-1** (7 pastas + 1 entrada). Ele é exagerado para um
app deste tamanho; abaixo está o 7-1 sem as pastas que este projeto ainda não
precisa:

```
resources/scss/
|
+-- app.scss                 <- UNICO arquivo sem "_". E a entrada.
|
+-- abstracts/               <- NAO gera CSS. So ferramentas.
|   +-- _variables.scss      <- tokens do CRM + overrides do Bootstrap
|   +-- _mixins.scss         <- mixins e funcoes suas
|   +-- _bootstrap-api.scss  <- funcoes/variaveis/mixins do Bootstrap, sem CSS
|   +-- _index.scss          <- reexporta os tres acima
|
+-- vendor/                  <- codigo de terceiros
|   +-- _bootstrap.scss      <- aqui o Bootstrap vira CSS de verdade
|
+-- base/                    <- estilo global, sem seletor de componente
|   +-- _typography.scss
|   +-- _index.scss
|
+-- layout/                  <- estruturas que se repetem entre paginas
|   +-- _navbar.scss
|   +-- _auth-shell.scss
|   +-- _index.scss
|
+-- components/              <- pecas reutilizaveis
|   +-- _button.scss
|   +-- _input.scss
|   +-- _card.scss
|   +-- _index.scss
|
+-- pages/                   <- estilo que so existe em UMA tela
    +-- _login.scss
    +-- _register.scss
    +-- _dashboard.scss
    +-- _index.scss
```

### A regra para escolher a pasta

| Pergunta | Pasta |
|---|---|
| Gera CSS? Não, é variável/mixin/função | `abstracts/` |
| É código de outra pessoa? | `vendor/` |
| Aplica em `html`, `body`, `a`, `h1`… sem classe de componente? | `base/` |
| É o esqueleto da tela (navbar, sidebar, footer, card de auth)? | `layout/` |
| É uma peça que aparece em mais de um lugar? | `components/` |
| Só existe nessa tela e em nenhuma outra? | `pages/` |

Na dúvida entre `components/` e `pages/`, **comece em `pages/`**. Promover para
`components/` quando reusar é fácil; o contrário gera componente genérico que
ninguém usa.

---

## A parte chata: Bootstrap 5.3 ainda vive no mundo antigo

Fato já verificado neste projeto (ver SASS-BOOTSTRAP.md): o Bootstrap 5.3.8 tem
40 `@import` e zero `@use`. Consequências práticas:

- `@use 'bootstrap/scss/bootstrap' with ($primary: ...)` **não funciona** — o Sass
  reclama que a variável não foi declarada com `!default` no módulo usado, porque
  ela chega lá via `@import` e não conta como membro configurável.
- O Dart Sass imprime avisos de depreciação em todo build.

**A solução arquitetural: isolar a sujeira em um arquivo só.**
`vendor/_bootstrap.scss` é o único lugar do projeto onde `@import` aparece. Todo
o resto usa `@use`. Quando o Bootstrap 6 migrar, você troca um arquivo.

Para calar os avisos, em `vite.config.js`:

```js
export default defineConfig({
    plugins: [ /* ... como ja esta ... */ ],
    css: {
        preprocessorOptions: {
            scss: {
                // O Bootstrap 5.3 ainda usa a sintaxe antiga do Sass.
                // Sem isto, cada build cospe centenas de avisos que nao sao nossos.
                silenceDeprecations: ['import', 'mixed-decls', 'global-builtin', 'color-functions'],
            },
        },
    },
    server: { /* ... */ },
});
```

Se o Sass reclamar que não acha `bootstrap/scss/...`, acrescente
`loadPaths: ['node_modules']` no mesmo bloco `scss`.

---

## Exemplo completo, arquivo a arquivo

### `resources/scss/abstracts/_variables.scss`

```scss
// Tokens da marca. Nenhuma regra CSS aqui - so valores.
// Este arquivo e lido tanto pelo nosso codigo quanto pelo Bootstrap,
// entao nao pode gerar saida.

// -- Marca ------------------------------------------------
$brand-green:  #13b497;
$brand-dark:   #232323;
$brand-muted:  #878a99;
$brand-light:  #f6f6f6;
$brand-border: #cbcbcb;

// -- Overrides do Bootstrap -------------------------------
// Toda variavel do Bootstrap termina com !default no fonte dele,
// que significa "use este valor SE ninguem definiu antes".
// Definindo aqui, e carregando ANTES do Bootstrap, nos ganhamos.
// Lista completa: node_modules/bootstrap/scss/_variables.scss
$primary:                 $brand-green;
$body-color:              $brand-muted;
$font-size-base:          .95rem;
$font-family-base:        'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif;
$border-radius:           7.4px;
$input-border-color:      $brand-border;
$input-placeholder-color: $brand-muted;

// -- Tokens so nossos -------------------------------------
$auth-card-max-width: 700px;
$auth-card-shadow:    0 8px 16px rgba(0, 0, 0, .15);
```

### `resources/scss/abstracts/_mixins.scss`

```scss
@use 'sass:color';
@use 'variables' as *;

/// Escurece uma cor sem usar darken(), que esta depreciada.
/// color.adjust mexe no HSL; -8% de luminosidade e o padrao de hover do CRM.
@function hover-shade($color, $amount: 8%) {
    @return color.adjust($color, $lightness: -$amount);
}

/// Centraliza qualquer coisa com flexbox. Chame com @include center;
@mixin center($direction: row) {
    display: flex;
    flex-direction: $direction;
    align-items: center;
    justify-content: center;
}
```

### `resources/scss/abstracts/_bootstrap-api.scss`

```scss
// Carrega as FERRAMENTAS do Bootstrap (funcoes, variaveis, mixins) sem gerar
// uma unica linha de CSS. E isto que permite usar media-breakpoint-up() ou
// shade-color() dentro dos nossos componentes sem duplicar o framework.
//
// A ordem e obrigatoria: functions -> nossas variaveis -> variables do BS -> mixins.
// Se as nossas variaveis vierem depois, o !default do Bootstrap ja venceu.

@import 'bootstrap/scss/functions';
@import 'variables';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/variables-dark';
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';
```

### `resources/scss/abstracts/_index.scss`

```scss
@forward 'variables';
@forward 'mixins';
@forward 'bootstrap-api';
```

### `resources/scss/vendor/_bootstrap.scss`

```scss
// Unico arquivo do projeto onde @import e permitido - o Bootstrap 5.3
// ainda nao migrou para @use. Isolando aqui, o resto do projeto fica moderno.
@import '../abstracts/bootstrap-api';  // funcoes + nossas variaveis + mixins
@import 'bootstrap/scss/bootstrap';    // agora sim: o framework inteiro, ja verde
```

> Quer um bundle menor? Troque a última linha pela lista dos componentes que
> você realmente usa (`@import 'bootstrap/scss/reboot';`, `grid`, `buttons`…).
> O arquivo `node_modules/bootstrap/scss/bootstrap.scss` é a lista completa para
> copiar. Faça isso **depois**, com a tela já funcionando.

### `resources/scss/base/_typography.scss`

```scss
@use '../abstracts' as *;

body {
    font-family: $font-family-base;
}
```

### `resources/scss/base/_index.scss`

```scss
@forward 'typography';
```

### `resources/scss/pages/_login.scss`

```scss
@use '../abstracts' as *;

// Aninhamento: o & e substituido pelo seletor pai, como texto.
// Por isso &-card vira .login-card e nao ".login .login-card".
.login {
    &-bg {
        background-color: $brand-green;
        min-height: 100vh;
        @include center;
    }

    &-card {
        width: 100%;
        max-width: $auth-card-max-width;
        border-radius: 10px;
        box-shadow: $auth-card-shadow;
        overflow: hidden;
    }

    &-panel-dark {
        background-color: $brand-dark;
        color: $brand-light;
        padding: 16px;
    }

    &-panel-form { padding: 20px; }

    &-subtitle { color: $brand-muted; font-size: .9em; }
    &-frase    { color: $brand-muted; font-size: .8em; }

    &-link {
        color: $brand-green;
        text-decoration: none;
        font-size: .9rem;

        &:hover { text-decoration: underline; }  // vira .login-link:hover
    }

    &-version { color: $brand-green; font-weight: 700; }

    &-logo,
    &-brand { width: 250px; height: auto; max-width: 100%; }
}
```

**O que sumiu** em relação ao `login.css` original: `.login-btn`,
`.login-btn:hover`, `.login-input`, `.login-input:focus` e o bloco `:root`
inteiro. Não foram esquecidos — o `$primary: $brand-green` fez o Bootstrap gerar
`.btn-primary` e o foco do `.form-control` já em verde. No JSX, troque
`className="btn login-btn"` por `className="btn btn-primary"` e
`className="login-input"` por `className="form-control"`.

Se ainda quiser ajuste fino no botão, é aqui que o mixin entra:

```scss
// components/_button.scss
@use '../abstracts' as *;

.btn-primary {
    &:hover { background-color: hover-shade($brand-green); }  // sem hex magico
}
```

### `resources/scss/pages/_index.scss`

```scss
@forward 'login';
@forward 'register';
@forward 'dashboard';
```

### `resources/scss/app.scss`

```scss
// Unico arquivo de entrada. Ele NAO tem regras CSS - so define a ordem
// em que as camadas entram na cascata. Do mais generico ao mais especifico:
// quem vem depois vence o empate de especificidade.

@use 'vendor/bootstrap';   // 1. framework (ja customizado pelas nossas variaveis)
@use 'base';               // 2. tags soltas
@use 'layout';             // 3. esqueleto das telas
@use 'components';         // 4. pecas reutilizaveis
@use 'pages';              // 5. excecoes de uma tela so
```

Este arquivo é a documentação viva da arquitetura. Quem precisar entender o CSS
do projeto começa por aqui.

### `resources/js/app.jsx`

```jsx
import 'bootstrap-icons/font/bootstrap-icons.css'; // CSS puro de vendor: entra pelo JS
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '../scss/app.scss';                          // nosso Sass, por ultimo
```

**Por que ícones e fonte saem do arquivo Sass?** Porque `@import 'algo.css'`
dentro de Sass **não inlina** o arquivo — ao ver a extensão `.css`, o Sass
repassa um `@import` literal para o CSS final, que o browser resolveria em
runtime. Funciona por acidente (o Vite depois resolve), mas é uma armadilha
clássica. CSS já compilado de terceiros entra pelo JS; Sass entra pelo Sass. O
Bootstrap é exceção porque importamos o **fonte** dele (`bootstrap/scss/...`),
não o `.css` pronto.

A ordem dos imports no `app.jsx` é a ordem no bundle final. `app.scss` por
último = nosso tema vence.

---

## Sintaxe Sass que você vai usar de verdade

**Aninhamento** — máximo 3 níveis. Cada nível vira especificidade que você vai
ter que vencer depois.

```scss
.card {
    padding: 1rem;
    .card-title { font-weight: 700; }               // .card .card-title
    &:hover     { box-shadow: $auth-card-shadow; }  // .card:hover
    &--dark     { background: $brand-dark; }        // .card--dark
}
```

O `&` é **substituição literal de texto**, não "o pai". Por isso `&--dark` gera
`.card--dark` e não `.card .card--dark`. É o truque que faz BEM funcionar.

**Mixin** = bloco de declarações reutilizável, com parâmetros.

```scss
@mixin truncate($lines: 1) {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
}

.login-frase { @include truncate(2); }
```

**Função** = devolve um valor (`@return`), não declarações. `hover-shade()` é uma.

**Maps + `@each`** — gerar variações sem repetir:

```scss
@use 'sass:map';

$status-colors: (
    'ativo':    #13b497,
    'pendente': #f7b84b,
    'inativo':  #878a99,
);

@each $name, $color in $status-colors {
    .badge-#{$name} {          // #{} = interpolacao: joga o valor no meio do texto
        background-color: $color;
    }
}
// gera .badge-ativo, .badge-pendente, .badge-inativo
```

**Funções de cor** — `darken()` e `lighten()` estão depreciadas. Use
`color.adjust()` (mexe no HSL) ou `color.scale()` (proporcional, mais previsível
em cores saturadas). O Bootstrap também expõe `tint-color($c, $weight)` e
`shade-color($c, $weight)`, que misturam com branco/preto — mais fiéis ao visual
dele.

**`@extend`: evite.** Ele reescreve seletores em lugares distantes do arquivo e
produz CSS imprevisível dentro de media queries. Mixin resolve o mesmo problema
de forma explícita, ao custo de alguns bytes que o gzip come.

---

## Checklist de migração

Faça nesta ordem, testando a cada passo:

1. `npm install -D "sass@^1"` (se ainda não fez)
2. Criar `resources/scss/` com a árvore acima, arquivos vazios
3. Preencher `abstracts/` e `vendor/_bootstrap.scss`
4. `app.scss` **só** com `@use 'vendor/bootstrap';`. Trocar o import no `app.jsx`.
   **Rodar.** A tela tem que ficar sem estilo próprio, mas com Bootstrap verde.
   Se quebrou aqui, é caminho ou ordem — não avance.
5. Migrar `_login.scss` para `pages/_login.scss` colando o conteúdo como está
   (Sass aceita CSS válido sem mudar nada). Rodar. Tela idêntica à de antes.
6. Só então refatorar: trocar hex por variável, aninhar, extrair
   `layout/_auth-shell.scss`, apagar o que o `$primary` tornou redundante
7. Ajustar os `className` no JSX (`login-btn` -> `btn-primary`,
   `login-input` -> `form-control`)
8. `git rm -r resources/css` quando nada mais referenciar

O passo 5 antes do 6 é o que evita depurar duas coisas ao mesmo tempo.

---

## Armadilhas

| Sintoma | Causa |
|---|---|
| Bootstrap continua azul | `_variables.scss` carregado **depois** de `bootstrap/scss/variables`. O `!default` já resolveu. |
| `Undefined variable` | Faltou o `@use` **naquele** arquivo. `@use` não é herdado do `app.scss`. |
| `@use rules must be written before any other rules` | Tem `@use` depois de uma regra CSS ou de um `@import`. |
| CSS duplicado no build | Alguém usou `@import` fora de `vendor/`. |
| Arquivo `.css` avulso em `public/build` | Faltou o `_` no nome do partial. |
| Avisos de depreciação infinitos | `silenceDeprecations` ausente no `vite.config.js`. |
| Mudou o `.scss` e nada acontece | `npm run dev` não estava rodando; ou o partial não tem `@forward` em nenhum índice. |
| `@import 'algo.css'` não inlina | Sass repassa `.css` como `@import` literal. CSS de vendor vai pelo `app.jsx`. |

---

## Resumo dos arquivos envolvidos

| Arquivo | Papel |
|---|---|
| `resources/scss/app.scss` | Entrada. Define a ordem da cascata. Sem regras CSS. |
| `resources/scss/abstracts/*` | Variáveis, mixins, API do Bootstrap. **Zero** CSS de saída. |
| `resources/scss/vendor/_bootstrap.scss` | Único lugar com `@import`. Emite o CSS do framework. |
| `resources/scss/{base,layout,components,pages}/_index.scss` | Barris: `@forward` na ordem da cascata. |
| `resources/js/app.jsx` | Importa CSS de vendor + `../scss/app.scss`. |
| `vite.config.js` | `css.preprocessorOptions.scss.silenceDeprecations`. |
| `package.json` | `sass@^1` em devDependencies. |

---

## Próximos passos

- [BOOTSTRAP-NO-PROJETO.md](BOOTSTRAP-NO-PROJETO.md) — níveis de customização e
  como achar qualquer classe na doc oficial.
- [CRUD-CLIENTES.md](CRUD-CLIENTES.md) — usar tudo isso numa tela real.
