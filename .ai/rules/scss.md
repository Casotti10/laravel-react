---
paths:
  - 'resources/scss/**'
---

# Scss

## O Sass é compilado pelo CLI, não pelo Vite
Fonte: `resources/scss/` (só .scss). Saída: `public/css/app.css`, gerada por `npm run sass` (script no package.json) e gitignorada — nunca edite nem commite a saída. O `<link>` está no `resources/views/app.blade.php`, com `?v=filemtime()` porque o arquivo não tem hash no nome. O Vite cuida só do JS e do CSS de vendor (bootstrap-icons e @fontsource/poppins, importados no `app.jsx` porque referenciam .woff2 por caminho relativo). `npm run dev` sobe sass --watch e vite juntos.

O comando precisa de `--load-path=node_modules` para achar `bootstrap/scss/bootstrap`, mais `--quiet-deps --silence-deprecation=import` para calar os avisos do Bootstrap 5.3 (que ainda usa @import; por isso o `sass` está pinado em ^1).

Ordem obrigatória dentro do `app.scss`: 1) nossas variáveis (ganham do `!default`), 2) `@import 'bootstrap/scss/bootstrap'`, 3) nossos partials (vencem a cascata e enxergam `$black`, `tint-color()`). Inverter 1 e 2 deixa o Bootstrap azul; inverter 2 e 3 dá `Undefined variable`.

Ao customizar, sobrescreva no topo da cadeia de derivação: `$focus-ring-width` (não `$input-btn-focus-width`) manda no anel de foco do `.form-control`; `$min-contrast-ratio: 2.5` é o que mantém o texto do `.btn-primary` branco sobre o verde da marca.
