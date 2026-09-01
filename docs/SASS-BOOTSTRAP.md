# Customizar o Bootstrap com Sass — roteiro da aula

Guia para acompanhar passo a passo enquanto você digita. O objetivo é **parar de
sobrescrever** o Bootstrap depois de compilado e passar a **compilá-lo já com as
cores e medidas do CRM**. Nada aqui foi aplicado ainda: o repositório continua
como estava até você executar os passos.

Pré-requisito: a tela de login funcionando (`../resources/js/pages/Auth/Login.jsx`).
Depois desta aula voltamos para `Auth/Register.jsx`.

## Estado atual em uma frase

O projeto consome `bootstrap.min.css` (CSS já pronto) e corrige o visual **por
cima**, em `../resources/css/login.css` — que hoje tem 5 blocos existindo só para
desfazer escolhas do framework.

## O que muda

| | Hoje (CSS compilado) | Depois (Sass) |
|---|---|---|
| O que importamos | `bootstrap/dist/css/bootstrap.min.css` | `bootstrap/scss/bootstrap` |
| Como mudamos o verde | uma classe nossa para cada elemento | `$primary: #13b497;` uma vez |
| Foco do input | regra manual `.login-input:focus` | vem verde sozinho |
| Briga de especificidade | constante | nenhuma |

## A teoria: `!default`

Abra `node_modules/bootstrap/scss/_variables.scss` e procure `$primary`:

```scss
$primary: $blue !default;
```

`!default` quer dizer: **"use este valor apenas se a variável ainda não tiver
um"**. Daí sai a regra inteira da customização:

```scss
$primary: #13b497;                    // 1. definiu primeiro  -> ganha
@import 'bootstrap/scss/bootstrap';   // 2. o !default lá dentro é ignorado
```

Inverta a ordem e não acontece absolutamente nada.

**O ganho não é o botão, é a cadeia de derivação.** Dentro do Bootstrap existe
`$component-active-bg: $primary`, e a partir dele
`$input-focus-border-color: tint-color($component-active-bg, 50%)`,
`$input-btn-focus-color`, `$link-color`, `.text-primary`, `.border-primary`,
`.form-check-input:checked`… Uma linha e o framework inteiro muda de cor.

## Fatos verificados neste projeto

Conferidos no `node_modules` em 01/09/2026 — não são suposições:

- **`sass` NÃO está instalado.** O Vite 8.2.1 não traz compilador de Sass; é
  dependência sua.
- **Bootstrap 5.3.8 é feito de `@import`** (40 deles em `bootstrap.scss`, zero
  `@use`). Por isso **não** funciona a sintaxe moderna
  `@use 'bootstrap' with (...)`. Nesta versão o padrão é *sobrescrever antes,
  importar depois*.
- Por consequência, o Dart Sass vai imprimir avisos de `@import` depreciado.
  É o Bootstrap, não o seu código — o passo 5 silencia.
- O JS do Bootstrap não está importado em lugar nenhum (`bootstrap.bundle.min.js`).
  Modal, dropdown, collapse, tooltip e toast **não funcionam** hoje. Ver
  [Próximos passos](#próximos-passos).

---

## Passo 1 — instalar o compilador

```powershell
npm install -D "sass@^1"
```

O `^1` é proposital: a linha 2.x do Dart Sass **remove** o `@import`, que o
Bootstrap 5.3 ainda usa. Ficar no 1.x é o que mantém os dois compatíveis.

## Passo 2 — criar `resources/css/app.scss`

Arquivo novo. Repare nos três blocos e, principalmente, na ordem entre eles:

```scss
// 1. NOSSAS VARIÁVEIS — antes do Bootstrap, senão o !default já terá vencido.

// Marca
$primary:                 #13b497;
$light:                   #f6f6f6;

// Tipografia
$font-family-base:        'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif;
$font-size-base:          .95rem;
$body-color:              #878a99;

// Formulários — o que hoje é a classe .login-input, escrito como configuração
$input-color:             #000;
$input-border-color:      #cbcbcb;
$input-placeholder-color: #878a99;
$input-padding-y:         .5rem;
$input-padding-x:         .75rem;
$input-btn-focus-width:   .2rem;

// Cantos
$border-radius:           .46rem;

// 2. O BOOTSTRAP, compilado do fonte já com os valores acima.
@import 'bootstrap/scss/bootstrap';

// 3. NOSSO TEMA por último — e agora ele enxerga as variáveis do Bootstrap.
@import 'login';
```

## Passo 3 — `login.css` vira `_login.scss`

```powershell
Rename-Item resources/css/login.css _login.scss
```

O underscore marca um **partial**: arquivo feito só para ser importado, que
nunca é compilado sozinho. No `@import 'login'` você omite tanto o `_` quanto a
extensão — quem resolve é o Sass.

Conteúdo novo (encolheu, porque metade virou variável no passo 2):

```scss
/* Tema do CRM. Só o que o Bootstrap não consegue gerar a partir de variáveis. */

.login-bg           { background-color: $primary; } /* a variável, não o hex repetido */

.login-card         { max-width: 700px; width: 100%;
                      border-radius: $border-radius * 2; /* Sass faz conta: .92rem */
                      box-shadow: 0 8px 16px rgba($black, .15); } /* rgba() aceita variável */

.login-panel-dark   { background-color: #232323; color: $light; padding: 16px; }
.login-panel-form   { padding: 20px; }

.login-subtitle     { color: $body-color; font-size: .9em; }
.login-frase        { color: $body-color; font-size: .8em; }

.login-link         { color: $primary; text-decoration: none; font-size: .9rem; }
.login-link:hover   { text-decoration: underline; }

.login-version      { color: $primary; font-weight: $font-weight-bold; }

.login-logo         { width: 250px; height: auto; max-width: 100%; }
.login-brand        { width: 250px; height: auto; max-width: 100%; }
```

**Sumiram `:root`, `.login-input`, `.login-input:focus`, `.login-input::placeholder`
e `.login-btn`** — os cinco blocos que existiam só para desfazer o Bootstrap.
É esse o resultado que a aula quer mostrar.

## Passo 4 — ajustar `resources/js/app.jsx`

Troque a primeira linha (`import '../css/app.css';`) por estas cinco:

```jsx
import 'bootstrap-icons/font/bootstrap-icons.css'; // pacotes de CSS puro entram pelo JS
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '../css/app.scss'; // por último: o que vier depois vence em caso de empate
```

**Por que fonte e ícones saíram do CSS:** dentro de um `.scss`, um `@import` que
termina em `.css` não é inlinado pelo Sass — vira um `@import` de verdade no CSS
final, que o navegador busca em requisição separada, fora do bundle. Importando
pelo JS, quem resolve é o Vite e tudo sai em um arquivo só.

## Passo 5 — silenciar o barulho, em `vite.config.js`

Acrescente esta chave dentro do `defineConfig({ ... })`, ao lado de `plugins` e
`server`:

```js
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true, // esconde os avisos de "@import deprecated" do node_modules
            },
        },
    },
```

`quietDeps` cala só as dependências — avisos do **seu** código continuam
aparecendo, que é exatamente o que se quer.

## Passo 6 — reiniciar e limpar

O Vite não recarrega config nem dependência nova em quente:

```powershell
# Ctrl+C no terminal do vite, depois:
npm run dev
```

Só depois que a página abrir sem erro:

```powershell
Remove-Item resources/css/app.css
```

---

## O teste que prova que funcionou

Com `http://login-crm.test/login` aberto, edite `resources/js/pages/Auth/Login.jsx`:

1. No botão, troque `className="btn login-btn"` por **`className="btn btn-primary"`**.
   Continua verde, com hover mais escuro — calculado pelo Bootstrap a partir de
   `$primary`.
2. Nos três `<input>`, apague o `login-input` de dentro do `className` (deixe
   `form-control` e o resto). Borda, padding, cor do placeholder e **o anel de
   foco verde** continuam iguais — agora vindos das variáveis.

Se o foco ficar **azul**, a ordem do passo 2 quebrou: seus `$` foram parar
depois do `@import`.

Prova objetiva no CSS gerado:

```powershell
npm run build
Select-String -Path public/build/assets/*.css -Pattern "13b497" | Select-Object -First 5
```

Aparecer `--bs-primary:#13b497` significa que o Bootstrap foi **recompilado**,
não sobrescrito.

## Como achar variáveis sozinho

A doc do site (`getbootstrap.com/docs/5.3/customize/sass/`) explica o `!default`,
mas lista poucas variáveis. **A documentação real é o fonte**: todas estão em
`node_modules/bootstrap/scss/_variables.scss`, cada uma com `!default`. Procure
por família — quase toda variável tem prefixo previsível:

```powershell
Select-String -Path node_modules/bootstrap/scss/_variables.scss -Pattern '^\$input-'
Select-String -Path node_modules/bootstrap/scss/_variables.scss -Pattern '^\$btn-'
Select-String -Path node_modules/bootstrap/scss/_variables.scss -Pattern '^\$enable-'
```

O terceiro é interessante: `$enable-shadows`, `$enable-gradients`,
`$enable-rounded`, `$enable-negative-margins` são chaves liga/desliga do
framework inteiro (doc em `/customize/options/`).

**Duas regras de bolso:**

- Se a coisa existe no Bootstrap (botão, input, card, alerta), procure a
  variável **antes** de escrever CSS novo. Quase sempre existe.
- Se não existe (o painel escuro, o card de 700px), aí sim é classe sua no
  `_login.scss`.

## Próximos passos

- **Build granular:** trocar `@import 'bootstrap/scss/bootstrap'` por uma lista
  só do que usamos (`functions`, `variables`, `maps`, `mixins`, `root`,
  `reboot`, `grid`, `forms`, `buttons`, `utilities/api`) corta o CSS pela
  metade. A lista completa para copiar está no topo do próprio
  `node_modules/bootstrap/scss/bootstrap.scss`.
- **Componentes que precisam de JS** (modal, dropdown, collapse): em projeto
  React o caminho não é importar `bootstrap.bundle.min.js`, é usar
  `react-bootstrap`. Aula separada, quando aparecer a necessidade.
- **Voltar para `Auth/Register.jsx`**, que ainda é o stub de 3 linhas — e que
  já vai nascer usando `btn-primary` e `form-control` puros.

## Resumo dos arquivos envolvidos

| Arquivo | O que acontece |
|---|---|
| `package.json` | ganha `sass` em `devDependencies` |
| `resources/css/app.scss` | **novo** — variáveis + Bootstrap + tema |
| `resources/css/_login.scss` | renomeado de `login.css`, encolhido |
| `resources/css/app.css` | **apagado** no passo 6 |
| `resources/js/app.jsx` | 1 import vira 5 |
| `vite.config.js` | ganha a chave `css.preprocessorOptions` |
| `resources/js/pages/Auth/Login.jsx` | `login-btn` → `btn-primary`, sai `login-input` |
