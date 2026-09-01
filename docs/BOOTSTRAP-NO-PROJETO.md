# Por onde o Bootstrap entra no projeto — e de onde vem cada classe

Mapa do caminho que o CSS do Bootstrap percorre até chegar no navegador, o
inventário das classes realmente usadas na tela de login, e como achar qualquer
outra na documentação oficial.

Descreve o **estado atual** (Bootstrap consumido já compilado). Quando a aula de
Sass for aplicada, o passo 4 do [`SASS-BOOTSTRAP.md`](SASS-BOOTSTRAP.md) muda
essa cadeia — a seção [Quando o Sass entrar](#quando-o-sass-entrar) resume o quê.

Versões conferidas em 01/09/2026: **bootstrap 5.3.8**, **bootstrap-icons 1.13.1**.

## A cadeia, em 5 elos

```
1. package.json            "bootstrap": "^5.3.8"
                             ↓  npm install
2. node_modules/bootstrap/dist/css/bootstrap.min.css
                             ↓  @import
3. resources/css/app.css   @import 'bootstrap/dist/css/bootstrap.min.css';
                           @import 'bootstrap-icons/font/bootstrap-icons.css';
                           @import '@fontsource/poppins/400.css';  (+600, +700)
                           @import './login.css';   ← nosso tema, por último
                             ↓  import
4. resources/js/app.jsx    import '../css/app.css';
                             ↓  @vite
5. resources/views/app.blade.php   @vite('resources/js/app.jsx')
                             ↓
                        <link> no <head> do navegador
```

Dois pontos que costumam confundir:

- **O CSS entra pelo JS.** O `vite.config.js` tem só `input: ['resources/js/app.jsx']`
  — não há entrada de CSS. Quem puxa a folha de estilo é o `import` na primeira
  linha do `app.jsx`; o Vite vê esse import, extrai o CSS e injeta o `<link>`.
- **A ordem dos `@import` no `app.css` é a regra de desempate.** Em CSS, com
  especificidade igual, o último a ser declarado vence. `login.css` é importado
  por último exatamente para ganhar do Bootstrap.

## O que está carregado — e o que NÃO está

| | Situação |
|---|---|
| CSS do Bootstrap | carregado (`bootstrap.min.css`) |
| Ícones | carregados (pacote **separado**, `bootstrap-icons`) |
| **JS do Bootstrap** | **NÃO carregado** — `bootstrap.bundle.min.js` não é importado em lugar nenhum |

Consequência prática do terceiro item: tudo que é CSS puro funciona (grid,
`form-control`, `btn`, utilitários), mas **modal, dropdown, collapse, tooltip,
toast e o menu offcanvas não funcionam** — eles dependem do JavaScript.

Em projeto React o caminho normal **não** é importar o JS do Bootstrap (ele
manipula o DOM por fora, brigando com o React), e sim usar a biblioteca
`react-bootstrap`, que reimplementa esses componentes como componentes React.
Assunto para quando a necessidade aparecer.

## O modelo mental: componentes vs utilitários

Toda classe do Bootstrap cai em um de dois grupos. Entender isso é o que faz
você achar as coisas sozinho na documentação.

| | Componente | Utilitário |
|---|---|---|
| O que é | um bloco pronto, com várias propriedades CSS | **uma** propriedade CSS, só isso |
| Exemplos | `btn`, `form-control`, `form-check` | `d-flex`, `mb-3`, `text-white`, `p-3` |
| Onde documenta | seções **Forms** e **Components** | seção **Utilities** |
| Quando usar | quando existe um componente pronto pro que você quer | pra ajustar espaçamento, alinhamento, cor |

## Inventário do `Auth/Login.jsx`

Todas as classes realmente presentes no arquivo, agrupadas pela página da
documentação onde estão descritas. Base das URLs: `https://getbootstrap.com/docs/5.3/`

### Grid — `/layout/grid/` e `/layout/gutters/`

`row` · `col-md-6` · `col-lg-6` · `g-0`

### Formulários — `/forms/form-control/` e `/forms/checks-radios/`

`form-control` · `form-label` · `form-check` · `form-check-input` · `form-check-label`

### Validação — `/forms/validation/`

`is-invalid` · `invalid-feedback`

É daqui que sai a borda vermelha. As duas trabalham em par: o Bootstrap só
mostra o `.invalid-feedback` quando existe um `.is-invalid` irmão antes dele.

### Botões — `/components/buttons/`

`btn`

### Utilitários — uma página por família em `/utilities/`

| Família | Página | Classes no arquivo |
|---|---|---|
| Flex | `/utilities/flex/` | `d-flex` `flex-column` `justify-content-center` `justify-content-between` `align-items-center` |
| Espaçamento | `/utilities/spacing/` | `p-3` `px-3` `pe-5` `m-0` `mb-0` `mb-2` `mb-3` `mb-4` `mt-3` `mt-4` `me-1` |
| Tamanho | `/utilities/sizing/` | `w-100` `min-vh-100` |
| Posição | `/utilities/position/` | `position-relative` `position-absolute` `top-50` `end-0` `translate-middle-y` |
| Cores | `/utilities/colors/` | `text-white` `text-light` `text-danger` `text-secondary` |
| Fundo | `/utilities/background/` | `bg-white` `bg-transparent` |
| Texto | `/utilities/text/` | `text-end` |
| Bordas | `/utilities/borders/` | `border-0` |
| Overflow | `/utilities/overflow/` | `overflow-hidden` |

### Não é Bootstrap CSS

`bi` `bi-eye` `bi-eye-slash` `bi-key` `bi-file-person` `bi-door-open` — pacote
separado `bootstrap-icons`. Catálogo pesquisável em `https://icons.getbootstrap.com`.

### Nossas, escritas à mão

Todas as que começam com `login-`, definidas em `../resources/css/login.css`:
`login-bg` `login-card` `login-panel-dark` `login-panel-form` `login-input`
`login-subtitle` `login-frase` `login-link` `login-version` `login-btn`
`login-logo` `login-brand`.

> **Nota de leitura do código:** um `grep className="..."` não encontra tudo. Os
> inputs usam template literal —
> ``className={`form-control login-input ${errors.email ? 'is-invalid' : ''}`}``
> — então `form-control`, `login-input`, `pe-5` e `is-invalid` só aparecem se
> você procurar por `` className={` `` também.

## Como achar qualquer classe sozinho

### 1. A fórmula dos utilitários de espaçamento

`{propriedade}{lados}-{breakpoint}-{tamanho}`

- **propriedade** — `m` = margin, `p` = padding
- **lados** — `t` top · `b` bottom · `s` start (esquerda) · `e` end (direita) · `x` horizontal · `y` vertical · *nada* = os quatro
- **tamanho** — `0` = 0 · `1` = .25rem · `2` = .5rem · `3` = 1rem · `4` = 1.5rem · `5` = 3rem · `auto`

Com isso você lê a classe sem consultar nada: `me-1` é `margin-right: .25rem`,
`pe-5` é `padding-right: 3rem`, `px-3` é `padding` esquerda **e** direita de 1rem.

### 2. O infixo de breakpoint

Vale para quase todo utilitário e para o grid. `col-md-6` = "6 de 12 colunas **a
partir de** 768px"; abaixo disso, ocupa a linha inteira.

| Infixo | A partir de | Doc |
|---|---|---|
| *(nenhum)* | 0 | `/layout/breakpoints/` |
| `sm` | 576px | |
| `md` | 768px | |
| `lg` | 992px | |
| `xl` | 1200px | |
| `xxl` | 1400px | |

Exemplos: `d-none d-md-block` (some no celular), `text-md-end` (alinha à direita
só a partir de 768px).

### 3. O caminho inverso — o mais útil no dia a dia

Abra a página, F12, clique no elemento e olhe o painel **Styles**: ele mostra
qual classe gerou cada propriedade e em qual arquivo. É assim que você descobre
por que o Bootstrap está vencendo o seu CSS — e qual regra precisa perder.

### 4. A busca da doc

`Ctrl+K` no site pesquisa por **nome de classe** e por **propriedade CSS**.
Procurar "flex-wrap" leva direto à página de flex.

### 5. A seção "CSS variables"

Quase toda página de componente tem uma. É a lista de variáveis `--bs-*` que
aquele componente lê — a porta de entrada do nível 1 abaixo.

## Os três níveis de customização

### Nível 1 — sobrescrever variável CSS

O Bootstrap 5.3 expõe quase tudo em `--bs-*`. Já é o que o topo do `login.css`
faz com `--bs-body-font-family` e `--bs-body-color`.

Cada componente também tem as suas. O `.login-btn` atual reescreve
`background-color` e por isso precisa repetir `color` no `:hover` (o `.btn`
redefine lá). Do jeito do Bootstrap seria:

```css
.login-btn {
    --bs-btn-bg: #13b497;
    --bs-btn-border-color: #13b497;
    --bs-btn-color: #fff;
    --bs-btn-hover-bg: #0f9c82;
    --bs-btn-hover-border-color: #0f9c82;
    --bs-btn-hover-color: #fff;
}
```

Mesmo resultado, sem briga de especificidade. Lista completa em
`/components/buttons/#css`.

### Nível 2 — sua própria classe, importada depois

É o `login.css` inteiro. Serve para o que o Bootstrap não tem: o verde da marca,
o painel escuro, o card de 700px.

### Nível 3 — recompilar o Bootstrap com Sass

Muda o framework na origem: `$primary: #13b497` e `btn-primary`, `text-primary`,
`border-primary` e o foco dos inputs já nascem verdes. Roteiro completo em
[`SASS-BOOTSTRAP.md`](SASS-BOOTSTRAP.md).

**Regra de bolso:** se a coisa existe no Bootstrap (botão, input, card, alerta),
procure a variável **antes** de escrever CSS novo — quase sempre existe. Se não
existe, aí sim é classe sua.

## Quando o Sass entrar

Depois de aplicar o [`SASS-BOOTSTRAP.md`](SASS-BOOTSTRAP.md), os elos 2, 3 e 4
da cadeia mudam:

| Elo | Hoje | Depois |
|---|---|---|
| 2 | `dist/css/bootstrap.min.css` (pronto) | `scss/bootstrap` (compilado no build) |
| 3 | `app.css` com 6 `@import` | `app.scss`: variáveis → Bootstrap → `_login.scss` |
| 4 | 1 import no `app.jsx` | 5 imports (ícones e Poppins passam a entrar pelo JS) |

Os elos 1 e 5 (`package.json` e `app.blade.php`) não mudam.

## Resumo dos arquivos envolvidos

| Arquivo | Papel |
|---|---|
| `../package.json` | declara `bootstrap` e `bootstrap-icons` |
| `../resources/css/app.css` | ponto de entrada do CSS; a ordem dos `@import` é o desempate |
| `../resources/css/login.css` | nosso tema — tudo que começa com `login-` |
| `../resources/js/app.jsx` | importa o CSS; é por ele que o Vite descobre a folha |
| `../resources/views/app.blade.php` | `@vite(...)` gera o `<link>` no `<head>` |
| `../vite.config.js` | `input` só com o `.jsx`; nenhuma entrada de CSS |
