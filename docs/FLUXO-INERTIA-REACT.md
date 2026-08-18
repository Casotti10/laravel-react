# Fluxo Inertia + React + Bootstrap neste projeto

Este documento explica, passo a passo, o que acontece entre o navegador pedir
`http://login-crm.test/` e a tela mostrar a página React — e para que serve
cada arquivo envolvido nesse caminho.

## Visão geral

```
Navegador                Laravel                          Vite / React
   |                        |                                   |
   |  GET /                 |                                   |
   |----------------------->|                                   |
   |                 routes/web.php                              |
   |                        |  Inertia::render('Teste', [...])   |
   |                 HandleInertiaRequests (middleware)           |
   |                        |  monta o "page object" (JSON)      |
   |                 resources/views/app.blade.php                |
   |                        |  HTML + <div id="app" data-page=..> |
   |<-----------------------|                                   |
   |  HTML completo                                              |
   |                                                              |
   |  o HTML pede os assets via @vite -------------------------->|
   |                                                    vite.config.js
   |                                                    resources/js/app.jsx
   |<-------------------------------------------------------------|
   |  JS compilado (bundle)                                       |
   |                                                              |
   |  o bundle roda no navegador:                                 |
   |    createInertiaApp() lê o data-page do <div id="app">       |
   |    resolve() importa resources/js/pages/Teste.jsx            |
   |    setup() monta o componente com createRoot().render()      |
   |                                                              |
   |  tela mostra o alert do Bootstrap com "Inertia respondendo"  |
```

Depois desse primeiro carregamento (full page load), navegações seguintes
feitas com `<Link>` do Inertia **não recarregam a página**: o cliente manda
uma requisição normal para a mesma rota Laravel, mas com o header
`X-Inertia: true`. O `HandleInertiaRequests` detecta esse header e faz
`Inertia::render()` devolver só o JSON da próxima página (sem o HTML/Blade em
volta), e o React troca o componente na tela sozinho. É isso que dá a
sensação de SPA usando rotas e controllers comuns do Laravel.

## Passo a passo detalhado

### 1. `../routes/web.php` — a rota decide qual página Inertia responder

```php
Route::get('/', function () {
    return Inertia::render('Teste', ['mensagem' => 'Inertia respondendo']);
});
```

`Inertia::render($componente, $props)` não devolve uma view Blade comum.
Ele monta um "page object": `{ component: 'Teste', props: {...}, url: '/', version: '...' }`.
O `$componente` (`'Teste'`) é só uma string — é o nome do arquivo que o
front-end vai procurar depois em `../resources/js/pages/Teste.jsx`. O Laravel
não sabe nada sobre React aqui; ele só descreve iqual a página quer mostrar e
**com quais dados**.

### 2. `../app/Http/Middleware/HandleInertiaRequests.php` — a ponte entre requisição e page object

Registrado em `../bootstrap/app.php`:

```php
$middleware->web(append: [
    \App\Http\Middleware\HandleInertiaRequests::class,
]);
```

Roda em toda requisição do grupo `web`, antes da rota. Responsabilidades:

- `rootView` (`'app'`) — diz que a view Blade raiz é `../resources/views/app.blade.php`.
- `version()` — gera um hash de versão dos assets; se o front-end percebe que
  a versão mudou (deploy novo), força um reload completo da página em vez de
  uma navegação parcial.
- `share()` — dados que vão em **toda** página automaticamente (usuário
  logado, flash messages, etc.), sem precisar repetir em cada `Inertia::render()`.
  Hoje só devolve o que a classe pai já compartilha (`...parent::share($request)`).

É esse middleware que decide, olhando o header `X-Inertia`, se a resposta vai
ser o HTML completo (`app.blade.php`) ou só o JSON do page object.

### 3. `../resources/views/app.blade.php` — a única view Blade da aplicação

```blade
<head>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    <x-inertia::head />
</head>
<body>
<x-inertia::app />
</body>
```

Só existe **uma** view Blade em todo o projeto — essa. Toda página da
aplicação (Teste, futuramente Login, Register, Dashboard...) é renderizada
dentro dela pelo React; o Laravel nunca mais escreve HTML de página depois
desse ponto.

- `@viteReactRefresh` — injeta o script do React Fast Refresh (Hot Module
  Replacement) antes do bundle, exigido pelo plugin `@vitejs/plugin-react`
  quando se usa Vite em modo dev.
- `@vite([...])` — resolve os caminhos dos assets (`app.css`, `app.jsx`),
  seja apontando pro servidor Vite em dev (com HMR) ou pros arquivos já
  buildados em `../public/build` em produção.
- `<x-inertia::head />` — placeholder onde componentes `<Head>` de cada
  página React podem injetar `<title>` e meta tags.
- `<x-inertia::app />` — renderiza `<div id="app" data-page="{...json...}"></div>`.
  Esse `data-page` é o page object inteiro (componente + props) serializado
  em JSON. É o único dado que o servidor "entrega" pro React: a partir daqui,
  tudo é JavaScript.

### 4. `../vite.config.js` — como os assets são compilados

```js
plugins: [
    laravel({
        input: ['resources/css/app.css', 'resources/js/app.jsx'],
        refresh: true,
    }),
    react(),
    inertia(),
],
```

- `laravel(...)` (plugin `laravel-vite-plugin`) — integra o Vite ao Laravel:
  sabe gerar o manifest que o `@vite()` do Blade lê, e onde publicar os
  arquivos buildados. `refresh: true` recarrega o navegador quando arquivos
  PHP/Blade mudam.
- `react()` — plugin do `@vitejs/plugin-react`; ensina o Vite a transformar
  JSX em JavaScript puro e habilita o Fast Refresh.
- `inertia()` — plugin do `@inertiajs/vite`; hoje cuida principalmente da
  integração com o Inertia DevTools e otimizações específicas do Inertia no
  build.

### 5. `../resources/js/app.jsx` — o ponto de entrada do front-end

```jsx
createInertiaApp({
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.jsx`,
            import.meta.glob('./pages/**/*.jsx')
        ),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
```

Esse arquivo roda uma vez, assim que o bundle carrega no navegador.
`createInertiaApp` faz o "boot" do lado cliente do Inertia:

- **`resolve(name)`** — recebe o nome do componente do page object (ex.:
  `'Teste'`) e precisa devolver o módulo React correspondente.
  `resolvePageComponent` + `import.meta.glob('./pages/**/*.jsx')` fazem isso
  de forma dinâmica: o Vite pré-mapeia todos os arquivos de `../resources/js/pages`
  e o helper importa só o que for pedido (code-splitting automático — cada
  página vira seu próprio chunk).
- **`setup({ el, App, props })`** — chamado depois que o componente foi
  resolvido. `el` é o `<div id="app">` que veio do Blade; `App` é o
  componente-wrapper interno do Inertia (ele já sabe trocar de página em
  navegações futuras); `props` são as props iniciais lidas do `data-page`.
  `createRoot(el).render(<App {...props} />)` é a API do React 19 que
  efetivamente desenha isso no DOM. **Sem essa linha, nada aparece na tela** —
  o Inertia resolve tudo, mas ninguém manda o React renderizar.

### 6. `../resources/js/pages/Teste.jsx` — a página em si

```jsx
export default function Teste({ mensagem }) {
    return (
        <div className="container py-5">
            <div className="alert alert-success" role="alert">
                {mensagem}
            </div>
        </div>
    );
}
```

Um componente React comum. Recebe como props exatamente o segundo argumento
que foi passado em `Inertia::render('Teste', ['mensagem' => '...'])` no
controller/rota — o nome da prop (`mensagem`) tem que bater dos dois lados.
As classes `container`, `py-5`, `alert`, `alert-success` são utilitárias do
Bootstrap (não são CSS escrito à mão).

### 7. `../resources/css/app.css` — estilos globais

```css
@import 'bootstrap/dist/css/bootstrap.min.css';
```

Um único `@import` trazendo o CSS pronto do Bootstrap (instalado via npm em
`../node_modules/bootstrap`). O Vite resolve esse import na hora do build. Não
há mais Tailwind no projeto.

## Resumo — responsabilidade de cada arquivo

| Arquivo | Responsabilidade |
|---|---|
| `../routes/web.php` | Define a URL e qual página Inertia (+ quais props) responder |
| `../app/Http/Middleware/HandleInertiaRequests.php` | Decide HTML completo vs. JSON parcial; injeta dados compartilhados e versão dos assets |
| `../bootstrap/app.php` | Registra o middleware acima no grupo `web` |
| `../resources/views/app.blade.php` | Única view Blade; carrega os assets e imprime o `<div id="app" data-page="...">` |
| `../vite.config.js` | Configura como Vite compila CSS/JSX e integra com Laravel, React e Inertia |
| `../resources/js/app.jsx` | Ponto de entrada JS: resolve qual componente de página usar e o monta no DOM |
| `resources/js/pages/*.jsx` | As páginas React de fato — uma por "tela" da aplicação |
| `../resources/css/app.css` | Estilos globais (hoje, só o import do Bootstrap) |
