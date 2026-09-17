# CRUD de Clientes — roteiro do zero ao fim

> Cadastro de Clientes completo — listar, criar, editar e excluir — com Laravel +
> Inertia + React, e a aparência feita com as classes do Bootstrap.
>
> **Siga na ordem.** Cada passo depende do anterior e termina com um **Confira**:
> só vá para o próximo quando a conferência passar.
>
> Docs relacionados: [FRONTEND.md](FRONTEND.md) (de onde vem cada classe, e o Sass),
> [criando-uma-pagina.md](criando-uma-pagina.md) (o caminho rota → controller → página),
> [AUTENTICACAO-BACKEND.md](AUTENTICACAO-BACKEND.md) (sessão e middleware `auth`).

## Índice

| Parte | Passos | Ao terminar, funciona |
|---|---|---|
| **COMECE AQUI** | — | você sabe o que vai construir e em que ordem |
| **FASE 1 — Banco de dados** | 1 a 4 | tabela `clientes` com 35 registros |
| **FASE 2 — Listar** | 5 a 11 | `/clientes` com tabela, cores e paginação |
| **FASE 3 — Criar** | 12 a 15 | cadastrar com validação e mensagem de sucesso |
| **FASE 4 — Editar** | 16 a 18 | editar pelo lápis |
| **FASE 5 — Excluir** | 19 e 20 | excluir com modal de confirmação |
| **FASE 6 — Fechar** | 21 e 22 | testes verdes e commit |
| **APÊNDICES** | — | A: o código completo de cada arquivo · B: deu errado? · C: usar a doc do Bootstrap · D: customizar o Bootstrap · E: próximos níveis · F: resumo dos arquivos |

---

# COMECE AQUI

## O que você vai construir

A lista — `GET /clientes`, arquivo `pages/Clientes/Index.jsx`:

```
┌──────────────────────────────────────────────────┐
│ [logo]  Dashboard  Clientes          Lucas  Sair │  ← AppLayout.jsx (passo 8)
├──────────────────────────────────────────────────┤
│ Cliente cadastrado com sucesso.                  │  ← alerta de flash (passo 15)
│                                                  │
│ Clientes                        [+ Novo cliente] │  ← Index.jsx (passos 7 a 11)
│ Nome        E-mail          Status   Ações       │  ← tabela (passo 9)
│ Ana Souza   ana@acme.test   Ativo    [e] [x]     │  ← "Ativo" colorido = badge (passo 10)
│ Bruno Lima  bruno@lima.test Inativo  [e] [x]     │  ← [e] lápis = editar (passo 18) · [x] lixeira = excluir (passo 20)
│ ...                                              │
│                   « 1 2 3 4 »                    │  ← paginação (passo 11)
└──────────────────────────────────────────────────┘
```

O formulário — `GET /clientes/create` (vazio) e `GET /clientes/5/edit`
(preenchido), **o mesmo** arquivo `pages/Clientes/Form.jsx`:

```
┌──────────────────────────────────────────────────┐
│ [logo]  Dashboard  Clientes          Lucas  Sair │
├──────────────────────────────────────────────────┤
│                                                  │
│   ┌─ Novo cliente ─────────────────────────────┐ │  ← Form.jsx (passo 14); no lápis vira "Editar cliente" (passo 18)
│   │ Nome [          ]  E-mail [          ]     │ │  ← campo vazio + Salvar = borda vermelha (passos 13 e 14)
│   │ Telefone [      ]  Status [Prospecto v]    │ │
│   │ Empresa [                            ]     │ │
│   │                                            │ │
│   │                        [Cancelar] [Salvar] │ │
│   └────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

O modal — aparece **por cima da lista** ao clicar na lixeira `[x]`. Não é outra
página nem outra URL:

```
┌──────────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ← ░ = fundo escuro (modal-backdrop), a lista fica atrás
│░░░░░ ┌─ Confirmar exclusão ─────────────────┐ ░░░│
│░░░░░ │ Excluir Ana Souza?                   │ ░░░│
│░░░░░ │ Esta ação não pode ser desfeita.     │ ░░░│
│░░░░░ │                                      │ ░░░│
│░░░░░ │                 [Cancelar] [Excluir] │ ░░░│  ← Cancelar fecha sem requisição; Excluir faz DELETE (passo 20)
│░░░░░ └──────────────────────────────────────┘ ░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└──────────────────────────────────────────────────┘
```

## Quem faz o quê

| Camada | Cuida de | Onde você escreve |
|---|---|---|
| **Laravel** | guardar, validar e entregar os dados | migration, model, controller, Form Request |
| **Inertia** | levar os dados do controller até o React, sem você escrever API | `Inertia::render()` no PHP; `useForm`, `<Link>`, `router` no JSX |
| **React** | o que aparece, o que o clique faz, o que foi digitado | os arquivos `.jsx` |
| **Bootstrap** (só o CSS) | a aparência | o texto dentro de `className="..."` |

Num pedaço do modal (passo 20) dá para ver as camadas separadas. Versão
**anotada**, só para ler:

```
{alvo && (                                      React: decide SE o modal aparece
    <div className="modal d-block">             Bootstrap: decide COMO ele fica
        Excluir <strong>{alvo.nome}</strong>?   React: mostra o dado, que veio do Laravel
        <button
            className="btn btn-danger"          Bootstrap: botão vermelho
            onClick={excluir}                   React: o que o clique faz
        >
```

**O JavaScript do Bootstrap não entra neste projeto.** A doc do Bootstrap abre e
fecha modal, alerta e dropdown com atributos `data-bs-toggle` e `data-bs-dismiss`.
Eles dependem de um script (`bootstrap.bundle.min.js`) que mexe no HTML por fora
do React, e os dois brigam — por exemplo, o X do alerta apaga o elemento sem
avisar o React, e na navegação seguinte a tela fica branca. Aqui **quem abre e
fecha é o React**, com estado. Você continua copiando o HTML da doc do Bootstrap;
só troca `data-bs-*` por `onClick` + estado. Detalhes no Apêndice C.4.

## Antes do passo 1

- [ ] `http://login-crm.test/login` abre e você consegue entrar (sem usuário? crie
      em `/register`)
- [ ] `npm run dev` rodando num terminal **separado**, e deixado aberto (sobe o
      Vite e o `sass --watch` juntos)
- [ ] No navegador, **F12** aberto o tempo todo:
  - aba **Console** — todo erro do React aparece aqui, mesmo quando a tela só fica
    branca
  - aba **Network** — cada conversa com o Laravel vira uma linha
    (`GET /clientes`, `POST /clientes`, `302`...)
- [ ] `php artisan migrate:status` responde sem erro (o MySQL está de pé)
- [ ] Deixe o **Apêndice C.3** (tabela de conversão HTML → JSX) à mão: você vai
      usar a partir da fase 2

## O roteiro

| Fase | Passo | O que | Arquivo(s) | Você confere |
|---|---|---|---|---|
| 1 Banco | 1 | Gerar os arquivos | terminal | 7 arquivos novos |
| | 2 | Migration | `database/migrations/*_create_clientes_table.php` | `migrate:status` → `Ran` |
| | 3 | Model | `app/Models/Cliente.php` | no passo 4 |
| | 4 | Factory + seeder | `ClienteFactory.php`, `ClienteSeeder.php` | 35 clientes no banco |
| 2 Listar | 5 | Rotas | `routes/web.php` | `route:list` → 6 rotas |
| | 6 | `index()` | `ClienteController.php` | `Page not found` no Console (bom sinal) |
| | — | *Leitura: o mapa do frontend* | — | — |
| | 7 | Ver os dados | `pages/Clientes/Index.jsx` | JSON cru na tela |
| | 8 | Layout | `layouts/AppLayout.jsx`, `Dashboard.jsx`, Sass | `/dashboard` com menu |
| | 9 | Tabela | `Index.jsx` | 10 linhas |
| | 10 | Status colorido | `Index.jsx` | verde, cinza, amarelo |
| | 11 | Paginação | `Index.jsx` | trocar de página |
| 3 Criar | 12 | `create()` e `store()` | `ClienteController.php` | no passo 14 |
| | 13 | Validação de criação | `StoreClienteRequest.php` | no passo 14 |
| | 14 | Formulário | `pages/Clientes/Form.jsx` | cadastrar; campo vazio fica vermelho |
| | 15 | Mensagem de sucesso | `HandleInertiaRequests.php`, `AppLayout.jsx` | alerta verde |
| 4 Editar | 16 | `edit()` e `update()` | `ClienteController.php` | no passo 18 |
| | 17 | Validação de edição | `UpdateClienteRequest.php` | no passo 18 |
| | 18 | Form no modo editar + lápis | `Form.jsx`, `Index.jsx` | editar e salvar |
| 5 Excluir | 19 | `destroy()` | `ClienteController.php` | no passo 20 |
| | 20 | Modal de confirmação | `Index.jsx` | excluir |
| 6 Fechar | 21 | Testes | `tests/Pest.php`, `tests/Feature/ClienteCrudTest.php` | testes verdes |
| | 22 | Formatar e commitar | terminal | suíte inteira verde |

**Por que em fatias (listar → criar → editar → excluir), e não "todo o backend,
depois todo o frontend"?** Porque cada fase termina com uma funcionalidade
**funcionando no navegador**. Se algo quebra, o erro está nos poucos arquivos da
fase atual — e não espalhado por quinze arquivos que você nunca testou. E você
enxerga a ligação: o método do controller que acabou de escrever é o que a tela
seguinte usa.

## Como fazer cada passo

```
1. Leia o passo inteiro antes de digitar
2. Digite — colar sem ler é o jeito mais rápido de não entender o erro depois
3. Salve e faça o "Confira"
4. Passou?     → próximo passo
   Não passou? → Apêndice B (sintoma → causa) antes de seguir
```

No fim de **cada fase**, feche com:

```powershell
vendor/bin/pint --dirty --format agent      # formata o PHP que você mexeu
git add -A
git commit -m "CRUD clientes: fase N - nome da fase"
```

Um commit por fase é um ponto de volta: se a fase seguinte embolar,
`git diff` mostra só o que mudou desde a última que funcionava.

---

# FASE 1 — Banco de dados

**Objetivo:** a tabela `clientes` existir no MySQL, com 35 registros falsos para
você ter o que listar.

## Passo 1 — Gerar os arquivos

**Onde:** terminal, na pasta do projeto.

```powershell
php artisan make:model Cliente --migration --factory --seed --controller --resource --requests --no-interaction
```

Um comando, sete arquivos. Para conferir as flags: `php artisan make:model --help`.

| Flag | Gera | Ganha código no passo |
|---|---|---|
| (o próprio comando) | `app/Models/Cliente.php` | 3 |
| `--migration` | `database/migrations/xxxx_create_clientes_table.php` | 2 |
| `--factory` | `database/factories/ClienteFactory.php` | 4 |
| `--seed` | `database/seeders/ClienteSeeder.php` | 4 |
| `--controller --resource` | `app/Http/Controllers/ClienteController.php`, com os 7 métodos vazios | 6, 12, 16, 19 |
| `--requests` | `app/Http/Requests/StoreClienteRequest.php` e `UpdateClienteRequest.php`, já ligados ao controller | 13, 17 |

Os arquivos nascem **vazios**: só o esqueleto, com `//` onde vai o código. Os
próximos passos preenchem um de cada vez, na ordem da tabela.

> **Confira:** `git status` lista os 7 arquivos novos.
> **Já rodou este comando antes?** Não rode de novo (ele reclama que o model já
> existe). Pule para o passo 2.

## Passo 2 — A migration

**Arquivo:** `database/migrations/xxxx_create_clientes_table.php` — o `xxxx` é a
data e a hora em que você rodou o passo 1.

Ela nasce só com `id()` e `timestamps()`. Complete o `up()`:

```php
public function up(): void
{
    Schema::create('clientes', function (Blueprint $table) {
        $table->id();
        $table->string('nome');
        $table->string('email')->unique();          // unique no banco: a validação sozinha tem corrida de dois cadastros simultâneos
        $table->string('telefone', 20)->nullable();
        $table->string('empresa')->nullable();
        $table->string('status')->default('prospecto');
        $table->timestamps();                        // created_at e updated_at, mantidos pelo Eloquent
    });
}
```

**Grave estas cinco palavras: `nome`, `email`, `telefone`, `empresa`, `status`.**
Elas vão aparecer **iguais** no model (passo 3), na factory (passo 4), na
validação (passos 13 e 17) e no formulário React (passo 14). É por elas que o
dado atravessa o sistema — uma letra diferente em qualquer ponto e o dado se
perde no caminho.

```powershell
php artisan migrate
```

> **Confira:** `php artisan migrate:status` mostra `create_clientes_table` como `Ran`.
> **Percebeu um erro na coluna depois de migrar?** Corrija o arquivo e rode
> `php artisan migrate:rollback` e depois `php artisan migrate` de novo (desfaz e
> refaz a última leva de migrations).

## Passo 3 — O model

**Arquivo:** `app/Models/Cliente.php` — o arquivo inteiro fica assim:

```php
<?php

namespace App\Models;

use Database\Factories\ClienteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Fillable = campos liberados para Cliente::create($dados).
 * Sem a lista, o create() estoura MassAssignmentException; com a lista,
 * um campo que ficou de fora é ignorado em silêncio.
 */
#[Fillable(['nome', 'email', 'telefone', 'empresa', 'status'])]
class Cliente extends Model
{
    /** @use HasFactory<ClienteFactory> */
    use HasFactory;
}
```

**`#[Fillable]` ou `protected $fillable`?** Fazem a mesma coisa. O atributo é o
jeito do Laravel 13 e é o que o `User.php` deste projeto usa; tutoriais mais
antigos mostram `protected $fillable = [...]` dentro da classe. Siga o projeto.

O Eloquent adivinha o nome da tabela pelo plural da classe: `Cliente` →
`clientes`. Bateu com a migration, então não precisa dizer nada.

> **Confira:** no passo 4 — o seed usa o model.

## Passo 4 — Factory e seeder: dados para ver na tela

**Arquivo:** `database/factories/ClienteFactory.php` — só o `definition()`:

```php
public function definition(): array
{
    return [
        'nome' => fake()->name(),
        'email' => fake()->unique()->safeEmail(),
        'telefone' => fake()->numerify('(##) #####-####'),
        'empresa' => fake()->company(),
        'status' => fake()->randomElement(['ativo', 'inativo', 'prospecto']),
    ];
}
```

**Arquivo:** `database/seeders/ClienteSeeder.php` — um `use` no topo e o `run()`:

```php
use App\Models\Cliente;
```

```php
public function run(): void
{
    Cliente::factory()->count(35)->create(); // 35 para a paginação de 10 em 10 ter 4 páginas
}
```

```powershell
php artisan db:seed --class=ClienteSeeder
```

> **Confira:** `php artisan tinker --execute 'echo App\Models\Cliente::count();'`
> mostra `35`.
> **`Unknown column`** → a factory usa um nome que não está na migration.
> **`Class "Database\Seeders\Cliente" not found`** → faltou o `use App\Models\Cliente;`
> no seeder.

### Fim da FASE 1

Funciona: a tabela existe e tem dados. Rode o `pint` e commite
(`"CRUD clientes: fase 1 - banco"`).

---

# FASE 2 — Listar

**Objetivo:** `/clientes` mostrando uma tabela paginada, dentro de uma navbar que
também passa a servir o Dashboard.

## Passo 5 — As rotas

**Arquivo:** `routes/web.php`

Hoje a rota do dashboard tem o próprio `->middleware('auth')`. Com as rotas de
clientes chegando, o certo é **agrupar** tudo que exige login. Duas mudanças:

**5a.** Um `use` no topo, junto dos outros:

```php
use App\Http\Controllers\ClienteController;
```

**5b.** Troque a rota do dashboard por este grupo (a rota vai para dentro dele e
perde o `->middleware('auth')`, porque o grupo já aplica):

```php
Route::middleware('auth')->group(function () { // tudo aqui dentro exige login
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::resource('clientes', ClienteController::class)->except(['show']); // 6 rotas numa linha
});
```

**5c.** No `ClienteController.php`, **apague o método `show()`**. A tela de
"detalhe de um cliente" não existe neste CRUD (a tabela já mostra tudo), por
isso o `except(['show'])` — e o método ficaria como código morto.

```powershell
php artisan route:list --path=clientes
```

| Verbo | URL | Método | Nome | Para quê | Ganha código na fase |
|---|---|---|---|---|---|
| GET | `/clientes` | `index` | `clientes.index` | listar | 2 |
| GET | `/clientes/create` | `create` | `clientes.create` | form de novo | 3 |
| POST | `/clientes` | `store` | `clientes.store` | gravar novo | 3 |
| GET | `/clientes/{cliente}/edit` | `edit` | `clientes.edit` | form de edição | 4 |
| PUT/PATCH | `/clientes/{cliente}` | `update` | `clientes.update` | gravar edição | 4 |
| DELETE | `/clientes/{cliente}` | `destroy` | `clientes.destroy` | excluir | 5 |

Entender essa tabela é entender REST: `/clientes` recebendo GET lista, recebendo
POST cria — **a URL é o recurso, o verbo é a ação**. É o mesmo princípio do
`/login` GET/POST que já existe no projeto.

> **Confira:** o `route:list` mostra as 6 rotas, e `/dashboard` continua abrindo
> quando você está logado.

## Passo 6 — O `index()`

**Arquivo:** `app/Http/Controllers/ClienteController.php`

Dois `use` novos no topo e o corpo do `index()`. **Os outros métodos continuam
vazios** — cada um ganha código na sua fase.

```php
use Inertia\Inertia;
use Inertia\Response;
```

```php
public function index(): Response
{
    return Inertia::render('Clientes/Index', [
        'clientes' => Cliente::latest()->paginate(10), // latest(): mais novos primeiro; paginate: 10 por página + os links
    ]);
}
```

Leia as duas strings com atenção, porque são a ponte com o React:

- `'Clientes/Index'` é um **caminho de arquivo**: o `app.jsx` transforma em
  `resources/js/pages/Clientes/Index.jsx`
- `'clientes'`, a chave do array, vira o parâmetro `{ clientes }` da função React

> **Confira:** abra `http://login-crm.test/clientes`. Tela branca, e no Console:
> `Page not found: ./pages/Clientes/Index.jsx`.
> **Esse erro é bom sinal:** o Laravel respondeu e o Inertia entendeu — só falta o
> arquivo React, que é o passo 7.

---

## Pausa: o mapa do frontend (leitura, sem código)

Antes do primeiro `.jsx`, três mapas. Volte a eles sempre que bater a dúvida
"onde eu coloco isto?".

### Mapa 1 — Onde fica cada arquivo

```
resources/
├── js/
│   ├── app.jsx                   não muda
│   ├── layouts/                  PASTA NOVA
│   │   └── AppLayout.jsx         NOVO   moldura: navbar + <main> + alerta          passos 8, 15
│   └── pages/
│       ├── Auth/...              não muda
│       ├── Dashboard.jsx         MUDA   troca a navbar própria pelo AppLayout      passo 8
│       └── Clientes/             PASTA NOVA
│           ├── Index.jsx         NOVO   a lista         GET /clientes              passos 7-11, 18, 20
│           └── Form.jsx          NOVO   criar E editar  GET /clientes/create       passos 14, 18
│                                                        GET /clientes/{id}/edit
└── scss/
    ├── app.scss                  MUDA   + @import 'layout'                         passo 8
    ├── _layout.scss              NOVO   cor da navbar (sai do _dashboard.scss)     passo 8
    └── _dashboard.scss           MUDA   fica só o que é do dashboard               passo 8
```

Três pastas, três papéis. É com esta tabela que você decide onde um código novo
vai morar:

| Pasta | O que mora lá | Como reconhecer | O controller cita no `Inertia::render`? |
|---|---|---|---|
| `pages/` | uma **tela** inteira | tem URL própria | **sim** — o caminho do arquivo é o nome que o controller escreve |
| `layouts/` | a **moldura** que se repete em várias telas | navbar, menu lateral, rodapé | não — é a página que chama o layout |
| `components/` | um **pedaço** reaproveitável | o mesmo bloco em 2+ telas | não — é importado por páginas ou layouts |

Este CRUD não precisa de `components/`. Crie a pasta no dia em que você copiar o
mesmo bloco pela segunda vez (a paginação, por exemplo, quando existir uma
segunda lista).

**Por que 2 telas para 6 rotas?** Só as rotas GET desenham tela (`index`,
`create`, `edit`). As que gravam (`store`, `update`, `destroy`) terminam em
`redirect` e não têm `.jsx` nenhum (é o POST-Redirect-GET, explicado no passo 12).
E `create` e `edit` mostram **os mesmos campos**; a única diferença é vir
preenchido ou vazio. Por isso uma `Form.jsx` só, com dois modos. (Muito tutorial
usa `Create.jsx` + `Edit.jsx` separados. Também funciona, com o dobro de código.)

### Mapa 2 — Quem chama quem

#### De clique em clique

| O usuário... | Requisição (aba Network) | Método do controller | O que o Laravel devolve | Tela que aparece | Fase |
|---|---|---|---|---|---|
| abre a lista | `GET /clientes` | `index()` | `render('Clientes/Index', ['clientes' => ...])` | `Index.jsx` | 2 |
| clica na página 2 | `GET /clientes?page=2` | `index()` | o mesmo, com outros 10 | `Index.jsx` | 2 |
| clica em "Novo cliente" | `GET /clientes/create` | `create()` | `render('Clientes/Form')` — **sem** `cliente` | `Form.jsx` vazio | 3 |
| salva o novo | `POST /clientes` | `store()` | `redirect` + flash | `Index.jsx` com alerta | 3 |
| salva com erro | `POST` ou `PUT` | nenhum: o Form Request barra antes | `redirect` de volta + `errors` | `Form.jsx`, campos intactos | 3 |
| clica no lápis | `GET /clientes/5/edit` | `edit()` | `render('Clientes/Form', ['cliente' => ...])` | `Form.jsx` preenchido | 4 |
| salva a edição | `PUT /clientes/5` | `update()` | `redirect` + flash | `Index.jsx` com alerta | 4 |
| clica na lixeira | **nenhuma** | — | — | o React só abre o modal | 5 |
| confirma no modal | `DELETE /clientes/5` | `destroy()` | `redirect` + flash | `Index.jsx` com alerta | 5 |

Leia a coluna "Tela que aparece" de cima a baixo: tudo desemboca em `Index.jsx`
ou em `Form.jsx`. É por isso que são só esses dois arquivos de página.

#### O que fica dentro do quê na tela

```
app.blade.php ── <div id="app">
└── app.jsx ── createInertiaApp
    └── pages/Clientes/Index.jsx         ← escolhida pelo Inertia::render('Clientes/Index')
        └── <AppLayout>                  ← a PÁGINA se embrulha no layout
            ├── <nav>                    ← igual em todas as telas logadas
            └── <main>
                ├── alerta verde         ← só existe se houver flash.success
                └── {children}           ← tudo que a Index escreveu dentro de <AppLayout>
```

O `children` é a peça que costuma confundir. Qualquer coisa que você escreve
**entre** a abertura e o fechamento de um componente chega nele como a prop
`children`, e o componente decide **onde** ela aparece:

```
// Index.jsx escreve:
<AppLayout>
    <h1>Clientes</h1>          ─┐
    <table>...</table>          ├─ tudo isto chega no AppLayout como `children`
</AppLayout>                   ─┘

// AppLayout.jsx decide o lugar:
<main className="container py-4">
    {children}
</main>
```

Se você já viu layout de Blade: é o `@yield('content')`, com a diferença de que
aqui quem chama o layout é a página, e não o contrário.

### Mapa 3 — Anatomia de um arquivo `.jsx`

Todo `.jsx` de página tem as mesmas seis zonas, sempre nesta ordem:

```jsx
// 1. IMPORTS — tudo que o arquivo usa e que não foi criado nele
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

// 2. CONSTANTES — valores fixos, que não dependem de props nem de estado
const corDoStatus = { ativo: 'text-bg-success' /* ... */ };

// 3. O COMPONENTE — os parâmetros são as props do Inertia::render()
export default function Index({ clientes }) {

    // 4. ESTADO — useState / useForm. Sempre no topo da função, nunca dentro de if
    const [alvo, setAlvo] = useState(null);

    // 5. AÇÕES — funções que rodam num clique ou num submit
    function excluir() { /* ... */ }

    // 6. O JSX — o que aparece. Só lê as zonas 2, 3 e 4 e chama a 5
    return (
        <AppLayout>
            {/* ... */}
        </AppLayout>
    );
}
```

Quando bater a dúvida "onde eu coloco isto?":

| Quero... | Zona | Exemplo neste CRUD |
|---|---|---|
| usar algo do React, do Inertia ou de outro arquivo meu | 1 | `import AppLayout from '../../layouts/AppLayout'` |
| um valor que nunca muda | 2 | a cor do badge de cada status |
| receber dado do banco | 3 | `{ clientes }` na Index, `{ cliente }` na Form |
| lembrar de algo que muda enquanto o usuário mexe | 4 | qual cliente o modal vai excluir; o que foi digitado |
| reagir a um clique ou submit | 5 | `excluir()`, `submit()` |
| mostrar algo | 6 | tabela, badge, modal |

#### As três fontes de dados

| Fonte | Nasce em | Como você lê | Exemplos |
|---|---|---|---|
| props da página | o array do `Inertia::render()` no controller | parâmetro da função (zona 3) | `clientes`, `cliente` |
| props compartilhadas | o `share()` do `HandleInertiaRequests` — chegam em **toda** tela | `usePage().props` | `auth.user`, `flash.success` |
| estado local | o próprio componente | `useState`, `useForm` (zona 4) | `alvo`, `data.nome` |

A regra para escolher: **se o dado está no banco, ele vem do Laravel. Se só
existe enquanto o usuário mexe na tela** (modal aberto, texto sendo digitado),
**é estado local.**

As compartilhadas também chegam como parâmetro nas **páginas** — o
`Dashboard.jsx` já faz `function Dashboard({ auth })`. No **layout** não chegam,
porque quem chama o layout é a página, não o Inertia. Por isso o `AppLayout` usa
`usePage()`.

#### O caminho do import

O caminho é contado **a partir do arquivo que está importando**. Cada `..` sobe
uma pasta:

```
resources/js/pages/Clientes/Index.jsx   importa   '../../layouts/AppLayout'
                    │                                │  │
                    │   ..    → sobe para pages/ ────┘  │
                    │   ../.. → sobe para js/ ──────────┘
                    └── e de js/ desce para layouts/AppLayout(.jsx)
```

| Quem importa | Caminho |
|---|---|
| `pages/Dashboard.jsx` | `'../layouts/AppLayout'` |
| `pages/Clientes/Index.jsx` | `'../../layouts/AppLayout'` |
| `pages/Clientes/Form.jsx` | `'../../layouts/AppLayout'` |

A extensão `.jsx` pode ficar de fora: o Vite procura sozinho. Errou a conta de
`..`? O Vite avisa em vermelho: `Failed to resolve import "../layouts/AppLayout"`.

---

## Passo 7 — Ver os dados antes de desenhar

**Arquivo:** crie a pasta `resources/js/pages/Clientes/` e, dentro dela, o
`Index.jsx` com **só isto**:

```jsx
export default function Index({ clientes }) {
    return <pre>{JSON.stringify(clientes, null, 2)}</pre>;
}
```

Abra `http://login-crm.test/clientes`. Resumindo o que aparece:

```json
{
  "current_page": 1,
  "data": [
    { "id": 35, "nome": "...", "email": "...", "telefone": "...", "empresa": "...", "status": "ativo", ... },
    ... mais 9
  ],
  "last_page": 4,
  "links": [
    { "url": null,                                    "label": "&laquo; Previous", "page": null, "active": false },
    { "url": "http://login-crm.test/clientes?page=1", "label": "1",                "page": 1,    "active": true  },
    { "url": "http://login-crm.test/clientes?page=2", "label": "2",                "page": 2,    "active": false },
    ...
    { "url": "http://login-crm.test/clientes?page=2", "label": "Next &raquo;",     "page": 2,    "active": false }
  ],
  "per_page": 10,
  "total": 35,
  ...
}
```

Isto vira o guia dos próximos passos: **a tabela vai ler `clientes.data`, a
paginação vai ler `clientes.links`.** Repare que `clientes` **não** é a lista — o
`paginate()` embrulha a lista em `data` e põe as informações de página em volta.

Esse é o hábito que mais economiza tempo: **não adivinhe o formato da prop,
olhe.** Serve para qualquer tela nova. (Alternativa: `console.log(clientes)` na
zona 4 e ver na aba Console.)

> **Confira:** o JSON aparece. **Se não:**
> ainda `Page not found: ./pages/Clientes/Index.jsx` → pasta ou arquivo com
> maiúscula diferente (`clientes/index.jsx` não serve);
> foi parar no `/login` → você não está logado;
> 404 do Laravel → a rota não existe (volte ao passo 5).

## Passo 8 — O layout: tirar a navbar do Dashboard

A navbar hoje mora dentro do `Dashboard.jsx`. Se a Index copiar, você terá duas
navbars para manter. O layout é o lugar único dela.

**8a.** Crie a pasta `resources/js/layouts/` e dentro dela o `AppLayout.jsx`:

```jsx
// resources/js/layouts/AppLayout.jsx
import { Link, usePage } from '@inertiajs/react';

// Moldura das telas logadas. Não é página: nenhum controller faz render('AppLayout').
// Quem usa é a página, embrulhando o próprio conteúdo.
export default function AppLayout({ children }) {
    const { url, props } = usePage(); // url = endereço atual; props = as compartilhadas
    const { auth } = props;

    return (
        <div className="app-layout">
            {/* navbar-expand sem breakpoint: sempre aberta, sem botão hambúrguer (que pediria o JS do Bootstrap) */}
            <nav className="navbar navbar-expand">
                <div className="container-fluid">
                    {/* Barra no início do src: sem ela, em /clientes/5/edit o navegador procura /clientes/5/images/... */}
                    <Link href="/dashboard" className="navbar-brand">
                        <img src="/images/diretrsiz.png" alt="Diretriz" width="40" height="40" />
                    </Link>

                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link href="/dashboard" className={`nav-link ${url.startsWith('/dashboard') ? 'active' : ''}`}>
                                Dashboard
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/clientes" className={`nav-link ${url.startsWith('/clientes') ? 'active' : ''}`}>
                                Clientes
                            </Link>
                        </li>
                    </ul>

                    <span className="navbar-text me-3">{auth.user.name}</span>

                    <Link href="/logout" method="post" as="button" className="btn btn-sm btn-outline-dark">
                        <i className="bi bi-box-arrow-right me-1"></i>Sair
                    </Link>
                </div>
            </nav>

            <main className="container py-4">
                {children}
            </main>
        </div>
    );
}
```

> **Componente:** Navbar — `components/navbar/`, seções "Supported content" e
> "Nav". Da doc ficaram `navbar-brand`, `navbar-nav`, `nav-item`, `nav-link`,
> `navbar-text`. Saíram o `navbar-toggler` e o `collapse` (dependem do JS do
> Bootstrap — Apêndice C.4). O `active` virou expressão: entra quando a URL atual
> começa com o endereço do link.

**8b.** O `Dashboard.jsx` perde a navbar e passa a usar o layout. O arquivo
inteiro:

```jsx
// resources/js/pages/Dashboard.jsx
import { Head } from '@inertiajs/react';
import AppLayout from '../layouts/AppLayout';

export default function Dashboard({ auth }) {
    return (
        <AppLayout>
            <Head title="Dashboard — CRM" />

            <div className="dashboard">
                <h1 className="h3 mt-3 text-center">Bem-vindo, {auth.user.name}</h1>
            </div>
        </AppLayout>
    );
}
```

**8c.** O estilo acompanha: o que é da moldura sai do `_dashboard.scss` e vai
para um partial novo.

```scss
// resources/scss/_layout.scss — a moldura das telas logadas (AppLayout.jsx)
.app-layout {
    min-height: 100vh;
    background-color: $white;

    .navbar {
        background-color: #0bdfbd;
    }
}
```

```scss
// resources/scss/_dashboard.scss — só o que é do dashboard
.dashboard {
    h1 {
        color: #333;
    }
}
```

```scss
// resources/scss/app.scss — no fim, depois do Bootstrap
@import 'login';
@import 'layout';
@import 'dashboard';
```

> **Confira:** `/dashboard` com a mesma cor de antes, agora com os links
> "Dashboard" e "Clientes" e o botão "Sair". Clique em **Clientes**: aparece o
> JSON do passo 7 **sem navbar**. Isso está certo, e é a prova de como o layout
> funciona: ele só aparece na página que se embrulha nele — e a Index ainda não
> se embrulha.

## Passo 9 — A tabela

**Arquivo:** `resources/js/pages/Clientes/Index.jsx` — substitua o conteúdo
inteiro:

```jsx
// resources/js/pages/Clientes/Index.jsx
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

export default function Index({ clientes }) {
    return (
        <AppLayout>
            <Head title="Clientes — CRM" />

            {/* Utilities de flex: título à esquerda, botão à direita */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 mb-0">Clientes</h1>
                <Link href="/clientes/create" className="btn btn-primary">
                    <i className="bi bi-plus-lg me-1"></i>Novo cliente
                </Link>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th scope="col">Nome</th>
                                <th scope="col">E-mail</th>
                                <th scope="col">Empresa</th>
                                <th scope="col">Status</th>
                                <th scope="col" className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.data.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td>{cliente.nome}</td>
                                    <td>{cliente.email}</td>
                                    <td>{cliente.empresa ?? '—'}</td>
                                    <td>{cliente.status}</td>
                                    <td className="text-end"></td>
                                </tr>
                            ))}

                            {clientes.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted py-5">
                                        Nenhum cliente cadastrado ainda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
```

A transformação que importa, da doc do Bootstrap para o seu código:

```
DOC (content/tables/)                   SEU JSX
3 linhas escritas à mão                 1 linha-modelo, repetida pelo .map()

<tbody>                                 <tbody>
  <tr><td>Mark</td>...</tr>               {clientes.data.map((cliente) => (
  <tr><td>Jacob</td>...</tr>     ──►          <tr key={cliente.id}>
  <tr><td>Larry</td>...</tr>                    <td>{cliente.nome}</td> ...
</tbody>                                      </tr>
                                          ))}
                                        </tbody>
```

Você apaga as linhas de exemplo, fica com **uma**, e troca o texto fixo pelo
campo do cliente. O `.map()` repete a linha para cada item de `clientes.data`.
O `key` é como o React reconhece cada linha entre um render e outro — use o `id`
do banco.

> **Componente:** Tables — `content/tables/`. Da mesma página vieram três
> modificadores: `table-hover` (destaca a linha sob o mouse), `align-middle`
> (centraliza na vertical — sem ele o badge do passo 10 fica torto) e o
> `.table-responsive` em volta (rola de lado no celular em vez de estourar).

> **Confira:** 10 linhas, agora com a navbar em cima. O botão "Novo cliente"
> ainda não funciona — o `create()` do controller está vazio. Esperado: ele ganha
> vida na fase 3.

## Passo 10 — Status colorido (badge)

**Arquivo:** `Index.jsx`, em dois lugares.

**Zona 2** — entre os imports e o `export default function`:

```jsx
// Fixo: não depende de props nem de estado, então mora fora do componente.
const corDoStatus = {
    ativo: 'text-bg-success',
    inativo: 'text-bg-secondary',
    prospecto: 'text-bg-warning',
};
```

**Zona 6** — dentro do `<tr>`, troque `<td>{cliente.status}</td>` por:

```jsx
<td>
    <span className={`badge text-capitalize ${corDoStatus[cliente.status]}`}>
        {cliente.status}
    </span>
</td>
```

`corDoStatus[cliente.status]` lê o objeto usando o status como chave: se o
status é `'ativo'`, devolve `'text-bg-success'`. Um status novo amanhã é uma linha
a mais no objeto, sem mexer no JSX.

> **Componente:** Badge — `components/badge/`. Original:
> `<span class="badge text-bg-primary">Primary</span>`. A cor fixa da doc virou
> uma consulta ao objeto. É o padrão que vai se repetir o tempo todo: **o
> Bootstrap dá o vocabulário, o React escolhe a palavra.** O `text-capitalize`
> (Utilities → Text) mostra "Ativo" em vez de "ativo".

> **Confira:** verde, cinza e amarelo na coluna Status.

## Passo 11 — Paginação

**Arquivo:** `Index.jsx`, **zona 6** — depois do `</div>` que fecha o `card`,
ainda dentro do `<AppLayout>`:

```jsx
{clientes.last_page > 1 && (
    <nav className="mt-3" aria-label="Paginação de clientes">
        <ul className="pagination justify-content-center">
            {clientes.links.map((link, indice) => (
                <li key={indice} className={`page-item ${link.active ? 'active' : ''} ${link.url ? '' : 'disabled'}`}>
                    {link.url ? (
                        <Link href={link.url} className="page-link" dangerouslySetInnerHTML={{ __html: link.label }} />
                    ) : (
                        <span className="page-link" dangerouslySetInnerHTML={{ __html: link.label }} />
                    )}
                </li>
            ))}
        </ul>
    </nav>
)}
```

Lendo com o JSON do passo 7 do lado:

- `clientes.last_page > 1 &&` → com uma página só, a paginação nem aparece
- `link.active` → a página atual ganha `active` (fica verde)
- `link.url` nulo → é o "Previous" na página 1 ou o "Next" na última: vira
  `<span>` com `disabled`, porque não há para onde ir
- `dangerouslySetInnerHTML` → o Laravel manda `&laquo;` como texto HTML; sem isto
  aparece escrito `&laquo; Previous` em vez de `« Previous`
- `key={indice}` → aqui não há `id`, e o Laravel pode mandar dois `"..."` com o
  mesmo label. A posição serve porque a lista inteira é trocada a cada página

> **Componente:** Pagination — `components/pagination/`. Original:
> `<nav><ul class="pagination"><li class="page-item"><a class="page-link" href="#">1</a></li>...`.
> O `<li>` fixo virou `.map()` sobre `clientes.links`, e o `<a>` virou `<Link>`
> para trocar de página sem recarregar.

> **Confira:** clique em 2, 3, 4. Na aba Network aparece `GET /clientes?page=2`,
> e a URL do navegador muda junto.

### Fim da FASE 2

Funciona: `/clientes` lista, colore e pagina, com menu; o Dashboard usa o mesmo
layout. Rode o `pint` e commite (`"CRUD clientes: fase 2 - listar"`).

---

# FASE 3 — Criar

**Objetivo:** "Novo cliente" abre um formulário que valida, grava e volta para a
lista com uma mensagem de sucesso.

## Passo 12 — `create()` e `store()`

**Arquivo:** `app/Http/Controllers/ClienteController.php`

Mais um `use` no topo:

```php
use Illuminate\Http\RedirectResponse;
```

E os dois métodos:

```php
public function create(): Response
{
    return Inertia::render('Clientes/Form'); // sem prop "cliente" = modo criação
}

public function store(StoreClienteRequest $request): RedirectResponse
{
    Cliente::create($request->validated()); // validated(): só os campos que passaram pelas regras

    return redirect()->route('clientes.index')
        ->with('success', 'Cliente cadastrado com sucesso.'); // flash: vive uma requisição só
}
```

**O padrão POST-Redirect-GET:** todo método que grava termina em `redirect()`,
nunca em `Inertia::render()`. Sem isso, o F5 do usuário reenvia o formulário. O
Inertia segue o redirect sozinho e troca a página.

**E a validação, onde está?** Não está dentro do método — está no **tipo do
parâmetro**. Por ele ser `StoreClienteRequest $request`, o Laravel roda as regras
**antes** de entrar no `store()`. Se alguma falhar, o método nem executa. As
regras são o passo 13.

> **Confira:** no passo 14.

## Passo 13 — A validação de criação

**Arquivo:** `app/Http/Requests/StoreClienteRequest.php` — os dois métodos:

```php
public function authorize(): bool
{
    return true; // nasce false = 403 em todo cadastro. A rota já exige login; permissão fina fica para uma Policy
}

public function rules(): array
{
    return [
        'nome' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'max:255', 'unique:clientes,email'],
        'telefone' => ['nullable', 'string', 'max:20'],
        'empresa' => ['nullable', 'string', 'max:255'],
        'status' => ['required', 'in:ativo,inativo,prospecto'],
    ];
}
```

As chaves são as mesmas cinco palavras da migration. Quando uma regra falha, o
Laravel volta para o formulário com o erro **naquela chave** (`errors.email`), e o
React do passo 14 pinta o campo certo. Você não escreve nada para isso acontecer.

> **Armadilha:** esquecer de trocar o `authorize()` para `true`. O arquivo nasce
> com `false`, e todo cadastro recebe **403 — This action is unauthorized**.

> **Confira:** no passo 14.

## Passo 14 — O formulário, no modo criar

**Arquivo:** crie `resources/js/pages/Clientes/Form.jsx`. Por enquanto só
**criar** — a edição entra no passo 18, mexendo em poucas linhas.

```jsx
// resources/js/pages/Clientes/Form.jsx
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

export default function Form() {
    // As chaves têm de ser IGUAIS às das rules() do StoreClienteRequest.
    const { data, setData, post, processing, errors } = useForm({
        nome: '',
        email: '',
        telefone: '',
        empresa: '',
        status: 'prospecto',
    });

    function submit(e) {
        e.preventDefault(); // sem isto o navegador recarrega a página inteira
        post('/clientes');  // -> store()
    }

    return (
        <AppLayout>
            <Head title="Novo cliente — CRM" />

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h1 className="h5 mb-0">Novo cliente</h1>
                        </div>

                        <div className="card-body">
                            {/* noValidate: desliga a validação do navegador; quem valida é o Laravel */}
                            <form onSubmit={submit} noValidate>
                                <div className="row g-3">

                                    <div className="col-md-6">
                                        <label htmlFor="nome" className="form-label">Nome</label>
                                        <input
                                            id="nome"
                                            type="text"
                                            className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                                            value={data.nome}
                                            onChange={(e) => setData('nome', e.target.value)}
                                            autoFocus
                                        />
                                        {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                                    </div>

                                    {/* email, telefone e empresa: mesmo bloco do nome — veja o Apêndice A */}

                                    <div className="col-md-6">
                                        <label htmlFor="status" className="form-label">Status</label>
                                        <select
                                            id="status"
                                            className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                        >
                                            <option value="prospecto">Prospecto</option>
                                            <option value="ativo">Ativo</option>
                                            <option value="inativo">Inativo</option>
                                        </select>
                                        {errors.status && <div className="invalid-feedback">{errors.status}</div>}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <Link href="/clientes" className="btn btn-outline-secondary">Cancelar</Link>
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        {processing && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
                                        {processing ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
```

### O bloco de campo — entenda um, copie os outros

Todo campo do formulário é o mesmo bloco de 4 peças. Entendido o do `nome`, os
outros são copiar e trocar a palavra. Versão **anotada**, só para ler — as
anotações à direita quebrariam o JSX; o código para digitar está acima:

```
<div className="col-md-6">                                    Grid: meia largura a partir de 768px
    <label htmlFor="nome" ...>Nome</label>                    htmlFor = id do input: clicar no texto foca o campo
    <input
        id="nome"
        className={`form-control ${errors.nome ? 'is-invalid' : ''}`}   borda vermelha SÓ se o Laravel devolveu erro
        value={data.nome}                                     o campo mostra o que está no estado...
        onChange={(e) => setData('nome', e.target.value)}     ...e cada tecla atualiza o estado
    />
    {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}   a mensagem que veio do Form Request
</div>
```

A palavra `nome` é a **ponte entre o backend e o frontend**. Ela precisa ser a
mesma em todos estes lugares, senão o dado se perde no caminho:

```
migration (passo 2)      Form Request (passo 13)     useForm (passo 14)      JSX (passo 14)
$table->string('nome') ► 'nome' => [...]          ►  nome: ''             ►  data.nome
                          valida a chave               envia a chave          setData('nome', ...)
                                │                                             errors.nome
                                └──── se falhar, o erro volta na MESMA chave ─────┘
```

> **Componentes:** Card (`components/card/`), Grid (`layout/grid/` — `row g-3`
> dá 1rem entre colunas; `col-md-6` põe dois campos por linha no desktop e um no
> celular), Form controls (`forms/form-control/`), **Select**
> (`forms/select/` — `<select>` usa `form-select`, não `form-control`; é o erro
> mais comum), Spinner (`components/spinners/`, variante small).
>
> **Validation** — `forms/validation/`, seção "Server side". A doc manda usar
> `.is-invalid` + `.invalid-feedback` quando quem valida é o servidor, que é o
> nosso caso. O `Register.jsx` já faz exatamente isso.

> **Confira:**
> 1. "Novo cliente" abre o formulário.
> 2. "Salvar" com tudo vazio → borda vermelha e mensagem no Nome. Na aba Network:
>    `POST /clientes` → `302` → a mesma tela, com o que você digitou intacto.
> 3. Preencha nome e um e-mail novo → volta para a lista, com o cliente novo no
>    topo (o `latest()` do passo 6). Network: `POST /clientes` → `302` →
>    `GET /clientes`.
>
> **403** ao salvar → `authorize()` ainda `false` (passo 13).
>
> Funcionou? Agora copie o bloco para **email, telefone e empresa** (a versão
> completa, com o ícone no e-mail, está no Apêndice A).

## Passo 15 — A mensagem de sucesso (flash)

O `store()` do passo 12 já manda a mensagem (`->with('success', ...)`), mas ela
fica guardada na sessão do Laravel. Falta **levar até o React** (15a) e
**mostrar** (15b).

**15a. Backend** — `app/Http/Middleware/HandleInertiaRequests.php`, dentro do
`share()`, logo depois do `auth`:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),

        'auth' => [
            // ... o que já existe, sem mudar nada
        ], // ← atenção: esta vírgula precisa existir agora

        'flash' => [
            'success' => fn () => $request->session()->get('success'), // fn(): só lê a sessão quando a página é montada
        ],
    ];
}
```

Tudo que está no `share()` chega em **toda** página como prop compartilhada — é o
mesmo caminho que o `auth.user` já faz.

**15b. Frontend** — `resources/js/layouts/AppLayout.jsx`, duas mudanças:

```jsx
const { auth, flash } = props; // era só { auth }
```

```jsx
<main className="container py-4">
    {flash.success && (
        <div className="alert alert-success" role="alert">
            <i className="bi bi-check-circle me-2"></i>{flash.success}
        </div>
    )}

    {children}
</main>
```

**Por que no layout e não na Index?** Porque a mensagem pode aparecer em
qualquer tela para onde um `redirect` levar. Estando na moldura, vale para todas.

**Por que sem o botão X de fechar?** O X da doc (`data-bs-dismiss="alert"`)
depende do JS do Bootstrap, e ele apaga o `<div>` direto do HTML sem avisar o
React. Na navegação seguinte o React tenta remover um elemento que não existe
mais — tela branca (Apêndice C.4). E o X nem faz falta: o flash vive **uma
requisição só**, então o alerta some sozinho no próximo clique.

> **Componente:** Alerts — `components/alerts/`. Original:
> `<div class="alert alert-primary" role="alert">A simple primary alert</div>`.
> Cor trocada para `alert-success`, texto para `{flash.success}`, e o `&&` faz o
> alerta só existir quando há mensagem.

> **Confira:** cadastre um cliente → alerta verde "Cliente cadastrado com
> sucesso." → clique na página 2 → o alerta some.
> **`Cannot read properties of undefined (reading 'success')`** → o `share()` não
> tem a chave `flash` (15a).

### Fim da FASE 3

Funciona: cadastrar, com validação e mensagem. Rode o `pint` e commite
(`"CRUD clientes: fase 3 - criar"`).

---

# FASE 4 — Editar

**Objetivo:** o lápis de cada linha abre o **mesmo** formulário, já preenchido,
e salva as alterações.

## Passo 16 — `edit()` e `update()`

**Arquivo:** `app/Http/Controllers/ClienteController.php`

```php
public function edit(Cliente $cliente): Response
{
    // Route model binding: o Laravel viu o tipo Cliente e o {cliente} da URL,
    // buscou no banco e devolve 404 sozinho se não achar.
    return Inertia::render('Clientes/Form', [
        'cliente' => $cliente, // com prop "cliente" = modo edição
    ]);
}

public function update(UpdateClienteRequest $request, Cliente $cliente): RedirectResponse
{
    $cliente->update($request->validated());

    return redirect()->route('clientes.index')
        ->with('success', 'Cliente atualizado.');
}
```

Compare com o passo 12: `edit()` é o `create()` **mais** o cliente; `update()` é
o `store()` trocando `create` por `update` num registro que já existe.

> **Confira:** no passo 18.

## Passo 17 — A validação de edição

**Arquivo:** `app/Http/Requests/UpdateClienteRequest.php`

Um `use` no topo:

```php
use Illuminate\Validation\Rule;
```

E os dois métodos:

```php
public function authorize(): bool
{
    return true;
}

public function rules(): array
{
    return [
        'nome' => ['required', 'string', 'max:255'],
        // Rule::unique ignorando o próprio registro — sem isso, salvar sem mudar
        // o e-mail acusa "já cadastrado". $this->cliente é o model do route binding.
        'email' => ['required', 'email', 'max:255', Rule::unique('clientes')->ignore($this->cliente)],
        'telefone' => ['nullable', 'string', 'max:20'],
        'empresa' => ['nullable', 'string', 'max:255'],
        'status' => ['required', 'in:ativo,inativo,prospecto'],
    ];
}
```

É o `StoreClienteRequest` com **uma** diferença, no `email`. Na criação, qualquer
e-mail já existente é duplicado. Na edição, o e-mail **do próprio cliente** já
existe no banco — e não pode contar como duplicado.

> **Confira:** no passo 18.

## Passo 18 — O formulário no modo editar, e o lápis

**18a.** No `Form.jsx`, cinco mudanças:

```jsx
// 1. recebe a prop (create() não manda; edit() manda)
// ANTES:
export default function Form() {
// DEPOIS:
export default function Form({ cliente }) {
```

```jsx
// 2. NOVO, logo no começo da função: em qual modo estamos?
const editando = Boolean(cliente);
```

```jsx
// 3. valores iniciais vêm do cliente, quando existir; e o put entra na lista
// ANTES:
const { data, setData, post, processing, errors } = useForm({
    nome: '',
    // ...

// DEPOIS:
const { data, setData, post, put, processing, errors } = useForm({
    nome: cliente?.nome ?? '',
    email: cliente?.email ?? '',
    telefone: cliente?.telefone ?? '',
    empresa: cliente?.empresa ?? '',
    status: cliente?.status ?? 'prospecto',
});
```

Os dois operadores, lidos em português:

- `cliente?.nome` → "o nome do cliente, **se existir cliente**". No modo criar,
  `cliente` é `undefined`, e sem o `?` daria erro.
- `?? ''` → "**se não tiver nada**, use texto vazio". Pega o modo criar e também
  `telefone` e `empresa`, que podem vir `null` do banco (são `nullable` na
  migration). Input do React com `null` gera o aviso *"changing an uncontrolled
  input to be controlled"*.

```jsx
// 4. o submit escolhe o verbo
function submit(e) {
    e.preventDefault();

    if (editando) {
        put(`/clientes/${cliente.id}`); // -> update()
    } else {
        post('/clientes');              // -> store()
    }
}
```

```jsx
// 5. título dinâmico — calcule uma vez (zona 4) e use nos dois lugares
const titulo = editando ? 'Editar cliente' : 'Novo cliente';

<Head title={`${titulo} — CRM`} />
<h1 className="h5 mb-0">{titulo}</h1>
```

**18b.** Na `Index.jsx`, o lápis — dentro da última `<td className="text-end">`,
que até agora estava vazia:

```jsx
<Link
    href={`/clientes/${cliente.id}/edit`}
    className="btn btn-sm btn-outline-secondary me-1"
    aria-label={`Editar ${cliente.nome}`}
>
    <i className="bi bi-pencil"></i>
</Link>
```

As crases (`` ` ``) montam texto com variável dentro: `` `/clientes/${cliente.id}/edit` ``
vira `/clientes/5/edit`. O `aria-label` dá nome ao botão, que só tem ícone, para
leitores de tela.

> **Confira:**
> 1. Lápis → formulário **preenchido**, com o título "Editar cliente".
> 2. Mude o nome, salve → lista com o nome novo e o alerta "Cliente atualizado.".
>    Network: `PUT /clientes/5`.
> 3. Salve **sem mudar o e-mail** → não pode reclamar de e-mail duplicado. Se
>    reclamar, falta o `Rule::unique()->ignore()` (passo 17).

### Fim da FASE 4

Funciona: editar pelo lápis. Rode o `pint` e commite
(`"CRUD clientes: fase 4 - editar"`).

---

# FASE 5 — Excluir

**Objetivo:** a lixeira abre um modal de confirmação; confirmar exclui e volta
com mensagem.

## Passo 19 — `destroy()`

**Arquivo:** `app/Http/Controllers/ClienteController.php`

```php
public function destroy(Cliente $cliente): RedirectResponse
{
    $cliente->delete();

    return redirect()->route('clientes.index')
        ->with('success', 'Cliente excluído.');
}
```

Não tem Form Request: não há dado para validar, só o `{cliente}` da URL — e o
route model binding já devolve 404 se ele não existir.

> **Confira:** no passo 20.

## Passo 20 — Excluir, com modal controlado pelo React

A ideia inteira cabe em quatro linhas:

```
alvo = null           → o modal não existe na tela
clicou na lixeira     → setAlvo(cliente)          → o React desenha o modal + fundo escuro
Cancelar ou X         → setAlvo(null)             → o React apaga
Excluir               → router.delete(...)        → terminou → setAlvo(null)
```

Uma variável de estado responde duas perguntas ao mesmo tempo: **o modal está
aberto?** (`alvo` tem algo) e **quem vai ser excluído?** (o que tem em `alvo`).

**Arquivo:** `Index.jsx`, em quatro lugares.

**Zona 1** — mudança nos imports:

```jsx
import { useState } from 'react';                     // NOVO
import { Head, Link, router } from '@inertiajs/react'; // + router
```

**Zonas 4 e 5** — no começo da função `Index`:

```jsx
const [alvo, setAlvo] = useState(null); // o cliente que o modal vai excluir; null = modal fechado

function excluir() {
    router.delete(`/clientes/${alvo.id}`, {
        onFinish: () => setAlvo(null), // sem isto o modal continua aberto depois de excluir
    });
}
```

Por que o `onFinish` é obrigatório: `post`, `put` e `delete` do Inertia
**preservam o estado** da página por padrão (é o que mantém o que você digitou
quando a validação falha). O `redirect` do `destroy()` volta para a mesma
`Index`, então o `alvo` continuaria preenchido — e o modal, aberto.

**Zona 6** — a lixeira, ao lado do lápis:

```jsx
<button
    type="button"
    className="btn btn-sm btn-outline-danger"
    aria-label={`Excluir ${cliente.nome}`}
    onClick={() => setAlvo(cliente)}
>
    <i className="bi bi-trash"></i>
</button>
```

**Zona 6** — o modal, no fim, logo antes do `</AppLayout>`:

```jsx
{alvo && (
    <>
        <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="tituloExcluir">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="tituloExcluir">Confirmar exclusão</h1>
                        <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setAlvo(null)}></button>
                    </div>
                    <div className="modal-body">
                        Excluir <strong>{alvo.nome}</strong>? Esta ação não pode ser desfeita.
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setAlvo(null)}>Cancelar</button>
                        <button type="button" className="btn btn-danger" onClick={excluir}>Excluir</button>
                    </div>
                </div>
            </div>
        </div>
        <div className="modal-backdrop show"></div>
    </>
)}
```

Da doc do Bootstrap para cá — o **HTML** do modal é o mesmo; só troca **quem
manda** nele:

| Na doc (`components/modal/`, "Vertically centered") | Aqui | Por quê |
|---|---|---|
| `class="modal fade" aria-hidden="true"` | `className="modal d-block"` | quem decide se aparece é o `{alvo && ...}`; o `d-block` vence o `display: none` que o `.modal` tem de fábrica |
| `data-bs-toggle="modal" data-bs-target="#..."` no botão | `onClick={() => setAlvo(cliente)}` | abrir = preencher o estado |
| `data-bs-dismiss="modal"` | `onClick={() => setAlvo(null)}` | fechar = limpar o estado |
| o JS do Bootstrap cria o fundo escuro | `<div className="modal-backdrop show">` | sem o JS, a gente desenha |
| `Modal title`, `...` | `{alvo.nome}` | dado do React |
| — | `<>...</>` | o JSX só devolve **um** elemento; o fragmento junta modal + fundo sem criar `<div>` extra |

O que se perde em relação ao Bootstrap com JS: a animação de entrada, fechar com
Esc e fechar clicando fora. Nenhum faz falta num modal de confirmação.

> **Confira:**
> 1. Lixeira → modal com o nome certo. Network: **nenhuma** requisição (abrir é
>    só estado).
> 2. Cancelar → fecha. Ainda nenhuma requisição.
> 3. Excluir → `DELETE /clientes/5` → `302` → `GET /clientes`; o modal fecha, a
>    linha some e aparece "Cliente excluído.".

### Fim da FASE 5

Funciona: o CRUD inteiro, no navegador. Rode o `pint` e commite
(`"CRUD clientes: fase 5 - excluir"`).

---

# FASE 6 — Fechar

**Objetivo:** provar com testes automáticos o que você conferiu na mão, para
saber na hora quando uma mudança futura quebrar algo.

## Passo 21 — Os testes

**21a.** Ligar o `RefreshDatabase` — `tests/Pest.php`. Hoje a linha está
comentada:

```php
pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class) // recria as tabelas a cada teste: um teste não suja o banco do próximo
    ->in('Feature');
```

Lembre: **os testes rodam em SQLite em memória, o app roda em MySQL** (quem manda
é o `phpunit.xml`). Seus 35 clientes do MySQL não aparecem nos testes — cada teste
cria os próprios dados com a factory.

**21b.** Criar o arquivo de teste:

```powershell
php artisan make:test --pest ClienteCrudTest
```

**21c.** `tests/Feature/ClienteCrudTest.php` — substitua o conteúdo:

```php
<?php

use App\Models\Cliente;
use App\Models\User;

it('cria um cliente', function () {
    $this->actingAs(User::factory()->create())
        ->post('/clientes', [
            'nome' => 'Acme',
            'email' => 'contato@acme.test',
            'status' => 'ativo',
        ])
        ->assertRedirect('/clientes');

    expect(Cliente::where('email', 'contato@acme.test')->exists())->toBeTrue();
});

it('recusa e-mail duplicado', function () {
    $cliente = Cliente::factory()->create();

    $this->actingAs(User::factory()->create())
        ->post('/clientes', ['nome' => 'X', 'email' => $cliente->email, 'status' => 'ativo'])
        ->assertSessionHasErrors('email');
});

it('bloqueia visitante', function () {
    $this->get('/clientes')->assertRedirect('/login');
});
```

Cada teste é um "Confira" que você fez na mão: o cadastro do passo 14, a
validação do passo 13, e o grupo `auth` do passo 5.

```powershell
php artisan test --compact --filter=ClienteCrudTest
```

> **Confira:** 3 testes passando.
> **`no such table: clientes`** → o `RefreshDatabase` ainda está comentado (21a).

## Passo 22 — Formatar, rodar tudo e commitar

```powershell
vendor/bin/pint --dirty --format agent
php artisan test --compact
git add -A
git commit -m "CRUD clientes: fase 6 - testes"
```

> **Confira:** a suíte **inteira** verde, não só a do CRUD.

**Terminou.** Próximos degraus no Apêndice E.

---

# APÊNDICES

## A — Arquivos finais

Terminou uma fase e algo não funciona? Compare **zona por zona** (Mapa 3) com a
versão final do arquivo. Nos passos intermediários o seu arquivo terá **menos**
coisas que estas — isso é esperado.

**O que está aqui:** todos os arquivos que o CRUD cria ou altera, na íntegra.
Os quatro grandes (controller, layout, `Index`, `Form`) são os que mais valem a
comparação zona por zona; os pequenos estão aqui para você conferir uma vírgula
ou um `use` sem ter que caçar o passo em que ele apareceu.

| | Arquivos | Passos |
|---|---|---|
| **A.1 — Backend** | migration · model · factory · seeder · rotas · controller · 2 Form Requests · middleware | 1–6, 12, 13, 15a, 16, 17, 19 |
| **A.2 — Frontend** | `AppLayout.jsx` · `Dashboard.jsx` · `Clientes/Index.jsx` · `Clientes/Form.jsx` | 7–11, 14, 15b, 18, 20 |
| **A.3 — Estilos** | `app.scss` · `_layout.scss` · `_dashboard.scss` | 8c |
| **A.4 — Testes** | `tests/Pest.php` · `ClienteCrudTest.php` | 21 |

## A.1 — Backend

### `database/migrations/xxxx_create_clientes_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('email')->unique();          // unique no banco: a validação sozinha tem corrida de dois cadastros simultâneos
            $table->string('telefone', 20)->nullable();
            $table->string('empresa')->nullable();
            $table->string('status')->default('prospecto');
            $table->timestamps();                        // created_at e updated_at, mantidos pelo Eloquent
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
```

> **Não apague o `down()`.** Ele vem pronto do `make:model -m` e é o que o
> `migrate:rollback` executa. Sem o método, o `Migrator` do Laravel **pula a
> volta em silêncio** (`method_exists($migration, $method)`, `Migrator.php:439`):
> o comando avisa "rolled back" com sucesso, apaga a linha da tabela
> `migrations` — e deixa a tabela `clientes` de pé no banco. O `migrate`
> seguinte morre com `Table 'clientes' already exists` e nada na tela explica de
> onde veio. É a migration que é reversível, não o comando.

### `app/Models/Cliente.php`

```php
<?php

namespace App\Models;

use Database\Factories\ClienteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Fillable = campos liberados para Cliente::create($dados).
 * Sem a lista, o create() estoura MassAssignmentException; com a lista,
 * um campo que ficou de fora é ignorado em silêncio.
 */
#[Fillable(['nome', 'email', 'telefone', 'empresa', 'status'])]
class Cliente extends Model
{
    /** @use HasFactory<ClienteFactory> */
    use HasFactory;
}
```

> **Lista vazia é o pior dos mundos.** `#[Fillable([])]` ou
> `protected $fillable = [];` não significa "libera tudo" — significa "não
> libera nada", e o `create()` estoura igual a não ter lista nenhuma.

### `database/factories/ClienteFactory.php`

```php
<?php

namespace Database\Factories;

use App\Models\Cliente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cliente>
 */
class ClienteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),          // unique(): a coluna é UNIQUE; sem isso o Faker repete e o seed morre em Duplicate entry
            'telefone' => fake()->numerify('(##) #####-####'), // cada # vira um dígito; parênteses e hífen ficam literais
            'empresa' => fake()->company(),
            'status' => fake()->randomElement(['ativo', 'inativo', 'prospecto']),
        ];
    }
}
```

### `database/seeders/ClienteSeeder.php`

```php
<?php

namespace Database\Seeders;

use App\Models\Cliente;
use Illuminate\Database\Seeder;

class ClienteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Cliente::factory()->count(35)->create(); // create() grava; make() só montaria os 35 objetos na memória
    }
}
```

> O `use Illuminate\Database\Console\Seeds\WithoutModelEvents;` que o
> `make:seeder` deixa no topo não é usado aqui — o `pint` o remove sozinho.

### `routes/web.php`

```php
<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\ClienteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Tudo aqui entra no middleware "web": sessão, cookies e CSRF já ligados.
// Cada tela de auth usa a mesma URL duas vezes — GET mostra o form, POST processa.

Route::get('/', function () {
    return Inertia::render('Teste', ['mensagem' => 'Inertia respondendo']); // procura resources/js/pages/Teste.jsx
});

Route::get('/register', [RegisteredUserController::class, 'create'])
    ->name('register'); // apelido: permite route('register') em vez da URL escrita na mão

Route::post('/register', [RegisteredUserController::class, 'store']); // valida e cria o usuário

Route::get('/login', [AuthenticatedSessionController::class, 'create'])
    ->name('login'); // nome obrigatório: o middleware "auth" redireciona pra rota chamada "login"

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('throttle:6,1'); // 6 req/min por IP; a 7ª leva 429 antes do controller

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth') // só quem está logado chega no controller
    ->name('logout'); // POST e não GET: prefetch do navegador ou <img> maliciosa disparam GET sozinhos

Route::middleware('auth')->group(function () { // tudo aqui dentro exige login
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::resource('clientes', ClienteController::class)->except(['show']); // 6 rotas numa linha
});
```

> **Por que o `/logout` ficou de fora do grupo?** Porque ele já carrega o
> próprio `->middleware('auth')` desde a aula de autenticação, e o passo 5 só
> mandou mover o dashboard. Movê-lo para dentro do grupo (e apagar o
> `->middleware('auth')` da linha) dá exatamente o mesmo resultado — é
> arrumação, não correção.

### `app/Http/Controllers/ClienteController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClienteRequest;
use App\Http\Requests\UpdateClienteRequest;
use App\Models\Cliente;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClienteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Clientes/Index', [
            'clientes' => Cliente::latest()->paginate(10), // latest(): mais novos primeiro; paginate: 10 por página + os links
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Clientes/Form'); // sem prop "cliente" = modo criação
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClienteRequest $request): RedirectResponse
    {
        Cliente::create($request->validated()); // validated(): só os campos que passaram pelas regras

        return redirect()->route('clientes.index')
            ->with('success', 'Cliente cadastrado com sucesso.'); // flash: vive uma requisição só
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Cliente $cliente): Response
    {
        // Route model binding: o Laravel viu o tipo Cliente e o {cliente} da URL,
        // buscou no banco e devolve 404 sozinho se não achar.
        return Inertia::render('Clientes/Form', [
            'cliente' => $cliente, // com prop "cliente" = modo edição
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClienteRequest $request, Cliente $cliente): RedirectResponse
    {
        $cliente->update($request->validated());

        return redirect()->route('clientes.index')
            ->with('success', 'Cliente atualizado.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cliente $cliente): RedirectResponse
    {
        $cliente->delete();

        return redirect()->route('clientes.index')
            ->with('success', 'Cliente excluído.');
    }
}
```

### `app/Http/Requests/StoreClienteRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreClienteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // nasce false = 403 em todo cadastro. A rota já exige login; permissão fina fica para uma Policy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:clientes,email'],
            'telefone' => ['nullable', 'string', 'max:20'],
            'empresa' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:ativo,inativo,prospecto'],
        ];
    }
}
```

### `app/Http/Requests/UpdateClienteRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClienteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            // Rule::unique ignorando o próprio registro — sem isso, salvar sem mudar
            // o e-mail acusa "já cadastrado". $this->cliente é o model do route binding.
            'email' => ['required', 'email', 'max:255', Rule::unique('clientes')->ignore($this->cliente)],
            'telefone' => ['nullable', 'string', 'max:20'],
            'empresa' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:ativo,inativo,prospecto'],
        ];
    }
}
```

> Os dois arquivos são idênticos menos por **uma** linha, a do `email`. Se você
> for comparar um com o outro para achar um erro, é lá que a diferença legítima
> mora — qualquer outra é engano.

### `app/Http/Middleware/HandleInertiaRequests.php`

Arquivo que já existia desde a aula de autenticação; o CRUD só acrescenta a
chave `flash` (passo 15a).

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app'; // Define a View principal do Inertia.

    public function version(Request $request): ?string
    {
        return parent::version($request); // Verifica a versão dos arquivos.
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request), // Mantém os dados padrão do Inertia.

            'auth' => [
                'user' => $request->user() ? [ // Verifica se há usuário logado.
                    'id' => $request->user()->id,       // ID
                    'name' => $request->user()->name,   // Nome
                    'email' => $request->user()->email, // E-mail
                ] : null, // Se não estiver logado, retorna null.
            ], // ← esta vírgula não existia enquanto 'auth' era o último item

            'flash' => [
                'success' => fn () => $request->session()->get('success'), // fn(): só lê a sessão quando a página é montada
            ],
        ];
    }
}
```

> Tudo que sai daqui chega em **toda** página como prop compartilhada — é por
> este mesmo caminho que o `auth.user` já viaja. Quem lê no React é o
> `usePage()` do `AppLayout`, nunca o parâmetro da função da página.

## A.2 — Frontend

### `resources/js/layouts/AppLayout.jsx`

```jsx
import { Link, usePage } from '@inertiajs/react';

// Moldura das telas logadas. Não é página: nenhum controller faz render('AppLayout').
// Quem usa é a página, embrulhando o próprio conteúdo.
export default function AppLayout({ children }) {
    const { url, props } = usePage(); // url = endereço atual; props = as compartilhadas
    const { auth, flash } = props;

    return (
        <div className="app-layout">
            {/* navbar-expand sem breakpoint: sempre aberta, sem botão hambúrguer (que pediria o JS do Bootstrap) */}
            <nav className="navbar navbar-expand">
                <div className="container-fluid">
                    {/* Barra no início do src: sem ela, em /clientes/5/edit o navegador procura /clientes/5/images/... */}
                    <Link href="/dashboard" className="navbar-brand">
                        <img src="/images/diretrsiz.png" alt="Diretriz" width="40" height="40" />
                    </Link>

                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link href="/dashboard" className={`nav-link ${url.startsWith('/dashboard') ? 'active' : ''}`}>
                                Dashboard
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/clientes" className={`nav-link ${url.startsWith('/clientes') ? 'active' : ''}`}>
                                Clientes
                            </Link>
                        </li>
                    </ul>

                    <span className="navbar-text me-3">{auth.user.name}</span>

                    <Link href="/logout" method="post" as="button" className="btn btn-sm btn-outline-dark">
                        <i className="bi bi-box-arrow-right me-1"></i>Sair
                    </Link>
                </div>
            </nav>

            <main className="container py-4">
                {/* Sem botão X: o flash vive uma requisição só e some no próximo clique */}
                {flash.success && (
                    <div className="alert alert-success" role="alert">
                        <i className="bi bi-check-circle me-2"></i>{flash.success}
                    </div>
                )}

                {children}
            </main>
        </div>
    );
}
```

### `resources/js/pages/Dashboard.jsx`

```jsx
import { Head } from '@inertiajs/react';
import AppLayout from '../layouts/AppLayout';

export default function Dashboard({ auth }) {
    return (
        <AppLayout>
            <Head title="Dashboard — CRM" />

            <div className="dashboard">
                <h1 className="h3 mt-3 text-center">Bem-vindo, {auth.user.name}</h1>
            </div>
        </AppLayout>
    );
}
```

> A navbar que morava aqui foi embora no passo 8 — ela agora é do `AppLayout`, e
> esta página só diz **o que tem dentro da moldura**. `auth` chega como
> parâmetro porque é prop compartilhada; o `AppLayout` lê a mesma coisa pelo
> `usePage()` porque componente de layout não recebe as props da página.

### `resources/js/pages/Clientes/Index.jsx`

```jsx
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

// Fixo: não depende de props nem de estado, então mora fora do componente.
const corDoStatus = {
    ativo: 'text-bg-success',
    inativo: 'text-bg-secondary',
    prospecto: 'text-bg-warning',
};

export default function Index({ clientes }) { // clientes = o paginate(10) do controller: a lista está em clientes.data
    const [alvo, setAlvo] = useState(null);   // o cliente que o modal vai excluir; null = modal fechado

    function excluir() {
        router.delete(`/clientes/${alvo.id}`, {
            onFinish: () => setAlvo(null), // delete preserva o estado da página: sem isto o modal fica aberto
        });
    }

    return (
        <AppLayout>
            <Head title="Clientes — CRM" />

            {/* Utilities de flex: título à esquerda, botão à direita */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 mb-0">Clientes</h1>
                <Link href="/clientes/create" className="btn btn-primary">
                    <i className="bi bi-plus-lg me-1"></i>Novo cliente
                </Link>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th scope="col">Nome</th>
                                <th scope="col">E-mail</th>
                                <th scope="col">Empresa</th>
                                <th scope="col">Status</th>
                                <th scope="col" className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.data.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td>{cliente.nome}</td>
                                    <td>{cliente.email}</td>
                                    <td>{cliente.empresa ?? '—'}</td>
                                    <td>
                                        <span className={`badge text-capitalize ${corDoStatus[cliente.status]}`}>
                                            {cliente.status}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <Link
                                            href={`/clientes/${cliente.id}/edit`}
                                            className="btn btn-sm btn-outline-secondary me-1"
                                            aria-label={`Editar ${cliente.nome}`}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            aria-label={`Excluir ${cliente.nome}`}
                                            onClick={() => setAlvo(cliente)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {clientes.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted py-5">
                                        Nenhum cliente cadastrado ainda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {clientes.last_page > 1 && (
                <nav className="mt-3" aria-label="Paginação de clientes">
                    <ul className="pagination justify-content-center">
                        {clientes.links.map((link, indice) => (
                            <li key={indice} className={`page-item ${link.active ? 'active' : ''} ${link.url ? '' : 'disabled'}`}>
                                {link.url ? (
                                    <Link href={link.url} className="page-link" dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <span className="page-link" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {/* O modal só existe enquanto há um alvo. Quem abre e fecha é o React, não o JS do Bootstrap. */}
            {alvo && (
                <>
                    <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="tituloExcluir">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="tituloExcluir">Confirmar exclusão</h1>
                                    <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setAlvo(null)}></button>
                                </div>
                                <div className="modal-body">
                                    Excluir <strong>{alvo.nome}</strong>? Esta ação não pode ser desfeita.
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setAlvo(null)}>Cancelar</button>
                                    <button type="button" className="btn btn-danger" onClick={excluir}>Excluir</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop show"></div>
                </>
            )}
        </AppLayout>
    );
}
```

### `resources/js/pages/Clientes/Form.jsx`

```jsx
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

// Uma tela, dois modos: create() não manda `cliente` (criar); edit() manda (editar).
export default function Form({ cliente }) {
    const editando = Boolean(cliente);
    const titulo = editando ? 'Editar cliente' : 'Novo cliente';

    // As chaves têm de ser IGUAIS às das rules() dos Form Requests.
    // `?? ''`: input do React não aceita null, e telefone/empresa podem vir null do banco.
    const { data, setData, post, put, processing, errors } = useForm({
        nome: cliente?.nome ?? '',
        email: cliente?.email ?? '',
        telefone: cliente?.telefone ?? '',
        empresa: cliente?.empresa ?? '',
        status: cliente?.status ?? 'prospecto',
    });

    function submit(e) {
        e.preventDefault(); // sem isto o navegador recarrega a página inteira

        if (editando) {
            put(`/clientes/${cliente.id}`); // -> update()
        } else {
            post('/clientes');              // -> store()
        }
    }

    return (
        <AppLayout>
            <Head title={`${titulo} — CRM`} />

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h1 className="h5 mb-0">{titulo}</h1>
                        </div>

                        <div className="card-body">
                            {/* noValidate: desliga a validação do navegador; quem valida é o Laravel */}
                            <form onSubmit={submit} noValidate>
                                <div className="row g-3">

                                    <div className="col-md-6">
                                        <label htmlFor="nome" className="form-label">Nome</label>
                                        <input
                                            id="nome"
                                            type="text"
                                            className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                                            value={data.nome}
                                            onChange={(e) => setData('nome', e.target.value)}
                                            autoFocus
                                        />
                                        {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="email" className="form-label">E-mail</label>
                                        {/* has-validation: sem ele a mensagem de erro não aparece dentro do input-group */}
                                        <div className="input-group has-validation">
                                            <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                                            <input
                                                id="email"
                                                type="email"
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                            />
                                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="telefone" className="form-label">Telefone</label>
                                        <input
                                            id="telefone"
                                            type="text"
                                            className={`form-control ${errors.telefone ? 'is-invalid' : ''}`}
                                            value={data.telefone}
                                            onChange={(e) => setData('telefone', e.target.value)}
                                        />
                                        {errors.telefone && <div className="invalid-feedback">{errors.telefone}</div>}
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="status" className="form-label">Status</label>
                                        <select
                                            id="status"
                                            className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                        >
                                            <option value="prospecto">Prospecto</option>
                                            <option value="ativo">Ativo</option>
                                            <option value="inativo">Inativo</option>
                                        </select>
                                        {errors.status && <div className="invalid-feedback">{errors.status}</div>}
                                    </div>

                                    <div className="col-12">
                                        <label htmlFor="empresa" className="form-label">Empresa</label>
                                        <input
                                            id="empresa"
                                            type="text"
                                            className={`form-control ${errors.empresa ? 'is-invalid' : ''}`}
                                            value={data.empresa}
                                            onChange={(e) => setData('empresa', e.target.value)}
                                        />
                                        {errors.empresa && <div className="invalid-feedback">{errors.empresa}</div>}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <Link href="/clientes" className="btn btn-outline-secondary">Cancelar</Link>
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        {processing && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
                                        {processing ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
```

## A.3 — Estilos

### `resources/scss/_layout.scss`

```scss
// resources/scss/_layout.scss — a moldura das telas logadas (AppLayout.jsx)
.app-layout {
    min-height: 100vh;
    background-color: $white;

    .navbar {
        background-color: #0bdfbd;
    }
}
```

> Este partial entra **depois** do Bootstrap (veja o `app.scss` abaixo), então
> ele enxerga as variáveis do framework: `$white` aqui é isso. Pela mesma razão,
> se a cor da navbar for a verde da marca, escreva `background-color: $primary;`
> em vez do hexadecimal repetido — a cor passa a ter um lugar só, o topo do
> `app.scss`.

### `resources/scss/_dashboard.scss`

```scss
// resources/scss/_dashboard.scss — só o que é do dashboard
.dashboard {
    h1 {
        color: #333;
    }
}
```

> Ficou pequeno de propósito: a navbar e o fundo saíram daqui para o
> `_layout.scss` no passo 8c. Um partial por tela, e o que é de **todas** as
> telas é do layout.

### `resources/scss/app.scss`

Só o fim do arquivo muda — o bloco 1 (variáveis) e o `@import` do Bootstrap
continuam exatamente como estão:

```scss
// 3. NOSSO TEMA por último: vence a cascata e enxerga $black, $font-weight-bold etc.
// Um partial por tela, todos depois do Bootstrap. Ele entra UMA vez só.
@import 'login';
@import 'layout';
@import 'dashboard';
```

> **A ordem não é decorativa.** Um `@import` de partial nosso **antes** do
> `@import 'bootstrap/scss/bootstrap'` quebra o build inteiro com
> `Undefined variable: $white` — porque a variável só passa a existir depois que
> o Bootstrap é compilado. Já aconteceu neste projeto.

## A.4 — Testes

### `tests/Pest.php`

Uma linha, hoje comentada:

```php
pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class) // recria as tabelas a cada teste: um teste não suja o banco do próximo
    ->in('Feature');
```

> O resto do arquivo (expectations, helpers) não muda. E lembre do que está no
> `phpunit.xml`: **os testes rodam em SQLite em memória, o app roda em MySQL**.
> Os seus 35 clientes do seeder não existem lá dentro — cada teste cria os
> próprios dados com a factory.

### `tests/Feature/ClienteCrudTest.php`

```php
<?php

use App\Models\Cliente;
use App\Models\User;

it('cria um cliente', function () {
    $this->actingAs(User::factory()->create())
        ->post('/clientes', [
            'nome' => 'Acme',
            'email' => 'contato@acme.test',
            'status' => 'ativo',
        ])
        ->assertRedirect('/clientes');

    expect(Cliente::where('email', 'contato@acme.test')->exists())->toBeTrue();
});

it('recusa e-mail duplicado', function () {
    $cliente = Cliente::factory()->create();

    $this->actingAs(User::factory()->create())
        ->post('/clientes', ['nome' => 'X', 'email' => $cliente->email, 'status' => 'ativo'])
        ->assertSessionHasErrors('email');
});

it('bloqueia visitante', function () {
    $this->get('/clientes')->assertRedirect('/login');
});
```

> Três testes, três "Confira" que você já fez na mão: o cadastro do passo 14, a
> validação do passo 13 e o grupo `auth` do passo 5. A diferença é que estes
> você não precisa refazer nunca mais.

## B — Deu errado? Sintoma → causa

### Backend

| Sintoma | Causa | Volte ao |
|---|---|---|
| `migrate` diz `Nothing to migrate`, mas faltam colunas | a migration já tinha rodado antes da edição | passo 2 (`migrate:rollback` + `migrate`) |
| `Unknown column` no seed | a factory usa um nome que não está na migration | passo 4 |
| `Target class [ClienteController] does not exist` | faltou o `use App\Http\Controllers\ClienteController;` | passo 5a |
| `route:list` não mostra as rotas de clientes | a linha do `Route::resource` não foi salva, ou está fora do arquivo | passo 5 |
| **403 — This action is unauthorized** ao salvar | `authorize()` do Form Request ainda `false` | passos 13 e 17 |
| `MassAssignmentException` ao salvar | o model está sem o `#[Fillable]` | passo 3 |
| Salvou, mas um campo ficou vazio no banco | a coluna ficou de fora da lista do `#[Fillable]` e foi ignorada em silêncio | passo 3 |
| Salvar sem mudar o e-mail dá "The email has already been taken." | faltou o `Rule::unique()->ignore()` | passo 17 |
| Salvou, voltou para a lista, mas sem alerta | faltou o `->with('success', ...)` no controller, ou o `flash` no `share()` | passos 12 e 15 |
| Teste: `no such table: clientes` | `RefreshDatabase` ainda comentado | passo 21a |

### Frontend

| Sintoma | Causa | Volte ao |
|---|---|---|
| Tela branca; Console: `Page not found: ./pages/...` | o arquivo não existe, ou o nome/maiúscula difere do `Inertia::render()` | passos 6 e 7 |
| Vite em vermelho: `Failed to resolve import` | conta de `..` errada no import | Mapa 3, "O caminho do import" |
| `Cannot read properties of undefined (reading 'map')` | usou `clientes.map` — a lista está em `clientes.data` | passo 7 |
| `Cannot read properties of undefined (reading 'success')` | `share()` sem a chave `flash` | passo 15a |
| `Cannot read properties of null (reading 'name')` no layout | abriu uma tela com `AppLayout` sem estar logado | passo 5 (rota fora do grupo `auth`) |
| Aviso `Each child in a list should have a unique "key"` | faltou `key` no elemento de dentro do `.map()` | passo 9 |
| Aviso `whitespace text nodes cannot be a child of <tr>` | comentário ou espaço na mesma linha, logo depois do `<tr>` | quebre a linha |
| Aviso `changing an uncontrolled input to be controlled` | valor inicial `null` ou `undefined` no `useForm` | passo 18 (`?? ''`) |
| Digito e o campo não muda | faltou `onChange`, ou a chave do `setData` difere da do `value` | passo 14, o bloco de campo |
| Clico em Salvar e a página recarrega inteira | faltou `e.preventDefault()` | passo 14 |
| Só a borda fica vermelha, sem mensagem | a `invalid-feedback` não está logo depois do input (tem que ser irmã dele), ou o `input-group` está sem `has-validation` | Apêndice A, `Form.jsx` |
| O `<select>` fica com visual estranho | `form-control` no `<select>` | troque por `form-select` |
| Formulário do lápis abre vazio | a `Form.jsx` ainda não recebe `{ cliente }` | passo 18a |
| Modal continua aberto depois de excluir | faltou o `onFinish` no `router.delete` | passo 20 |
| Logo some em `/clientes/5/edit`, mas aparece no `/dashboard` | `src="images/..."` sem a barra inicial | passo 8a |
| Navbar sem cor | `_layout.scss` não importado no `app.scss`, ou `npm run dev` parado | passo 8c |
| Alterei o `.jsx` e nada mudou | `npm run dev` parado | terminal |

---

## C — Como usar a documentação oficial do Bootstrap

### C.1 O mapa do site

`https://getbootstrap.com/docs/5.3/` tem seis seções no menu esquerdo. Saber
qual abrir é metade do trabalho:

| Seção | O que tem | Quando você abre |
|---|---|---|
| **Layout** | Container, Grid, Columns, Gutters, Breakpoints | "Como coloco isso lado a lado?" |
| **Content** | Reboot, Typography, **Tables**, Images, Figures | "Como faço uma tabela?" |
| **Forms** | Form control, Select, Checks, Input group, Floating labels, **Validation**, Layout | Qualquer campo de formulário |
| **Components** | Alert, Badge, Button, Card, Dropdown, **Modal**, Nav, Navbar, **Pagination**, Spinner, Toast… | Peças prontas de UI |
| **Helpers** | Ratio, Stacks, Vertical rule, Stretched link, Text truncation | Utilitários compostos |
| **Utilities** | Spacing, Flex, Display, Colors, Borders, Sizing, Text… | Classes de uma linha só |

Acima delas, **Customize** — Overview, Sass, Options, Color, Color modes,
Components, CSS variables, Optimize. É o Apêndice D.

**Regra prática:** antes de escrever CSS, procure em *Utilities*. Antes de
montar HTML do zero, procure em *Components*. Você quase nunca precisa dos dois.

### C.2 O fluxo de copiar da doc

Toda página de componente tem o mesmo formato: um exemplo renderizado e, abaixo,
o HTML num bloco com botão de copiar. O fluxo é sempre:

```
1. Abrir a pagina do componente
2. Clicar em "Copy" no bloco do exemplo mais proximo do que voce quer
3. Colar no JSX
4. Aplicar as 6 conversoes da tabela C.3
5. Trocar textos fixos por variaveis do React ({cliente.nome})
6. Trocar href="#" por <Link href={...}> quando for navegacao interna
```

O passo 4 é mecânico. O 5 e o 6 são onde você pensa.

### C.3 Tabela de conversão HTML → JSX

É o único obstáculo entre a doc do Bootstrap e o seu código:

| No HTML da doc | No seu JSX | Por quê |
|---|---|---|
| `class="btn"` | `className="btn"` | `class` é palavra reservada em JS |
| `for="email"` | `htmlFor="email"` | idem `for` |
| `tabindex="-1"` | `tabIndex={-1}` | JSX usa camelCase em props do DOM |
| `<input ...>` `<img ...>` `<hr>` | `<input ... />` `<img ... />` `<hr />` | JSX exige toda tag fechada |
| `style="width: 25%"` | `style={{ width: '25%' }}` | objeto JS, chaves em camelCase |
| `<!-- comentário -->` | `{/* comentário */}` | comentário HTML não existe em JSX |

**O que NÃO muda** — e é isso que torna o Bootstrap confortável no React:

- `data-bs-toggle`, `data-bs-target`, `data-bs-dismiss` → colam iguais
  (atributos `data-*` passam direto) — **mas não fazem nada** neste projeto,
  que não carrega o JS do Bootstrap. Veja C.4
- `aria-label`, `aria-hidden`, `aria-current`, `role` → iguais
- `id`, `type`, `placeholder`, `disabled`, `scope` → iguais

Exemplo mínimo, copiado de `components/buttons/`:

```html
<!-- ORIGINAL DA DOC -->
<button type="button" class="btn btn-primary">Primary</button>
```

```jsx
{/* NO SEU CODIGO */}
<button type="button" className="btn btn-primary">Primary</button>
```

Um com mais atrito, de `forms/validation/`:

```html
<!-- ORIGINAL DA DOC -->
<label for="validationCustom01" class="form-label">First name</label>
<input type="text" class="form-control is-valid" id="validationCustom01" required>
<div class="valid-feedback">Looks good!</div>
```

```jsx
{/* NO SEU CODIGO - 3 conversoes + os dados do React */}
<label htmlFor="nome" className="form-label">Nome</label>
<input
    type="text"
    className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
    id="nome"
    value={data.nome}
    onChange={(e) => setData('nome', e.target.value)}
/>
{errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
```

Note o que aconteceu: `is-valid` (classe fixa da doc) virou uma **expressão** —
a classe entra só quando o Laravel devolveu erro naquele campo. É esse o pulo do
gato: **no Bootstrap as classes são estados visuais; no React você liga esses
estados a variáveis.** Você já faz isso no `Register.jsx`.

### C.4 O JS do Bootstrap — aqui ele NÃO entra

O projeto importa só o **CSS** do Bootstrap. Os componentes se dividem assim:

| Funcionam só com CSS | Abrem/fecham com JS |
|---|---|
| Buttons, Card, Table, Badge, Grid, Forms, Spinner, Progress, List group, Breadcrumb, **Pagination**, **Alert** (sem o X) | **Modal**, Dropdown, Offcanvas, Collapse, Navbar toggler, Tabs, Toast, Tooltip, Popover, Carousel, Alert com o X |

Os `data-bs-toggle` e `data-bs-dismiss` que aparecem na doc são ganchos para o
arquivo `bootstrap.bundle.min.js`. Sem ele, colam no JSX sem erro nenhum — e
não fazem nada.

**Decisão deste projeto: não importar o bundle. Quem abre e fecha é o React.**
O motivo é que o JS do Bootstrap mexe no HTML por fora do React. Exemplo
concreto: o X do alerta (`data-bs-dismiss="alert"`) apaga o `<div>` direto da
página; o React não fica sabendo e, na navegação seguinte, tenta remover um
elemento que não existe mais — tela branca com erro no Console.

O padrão, usado no modal do passo 20:

```
BOOTSTRAP COM JS (a doc)                  REACT (este projeto)
data-bs-toggle="modal"             ──►    onClick={() => setAlvo(cliente)}
data-bs-dismiss="modal"            ──►    onClick={() => setAlvo(null)}
o JS põe .show e display: block    ──►    {alvo && <div className="modal d-block">...}
o JS cria o fundo escuro           ──►    <div className="modal-backdrop show"></div>
```

Você continua copiando o **HTML** da doc. Só troca os `data-bs-*` por estado do
React. Para componentes em que isso dá trabalho demais (dropdown que precisa se
posicionar na tela, tooltip), o caminho é o `react-bootstrap` — uma dependência
nova, que fica para quando você precisar.

### C.5 Decodificar um nome de classe

As Utilities seguem uma fórmula. Aprender a fórmula vale mais que decorar classes:

```
{propriedade}{lado}-{breakpoint}-{tamanho}
```

- **propriedade**: `m` = margin, `p` = padding
- **lado**: `t` top, `b` bottom, `s` start/esquerda, `e` end/direita,
  `x` horizontal, `y` vertical, *nada* = todos
- **breakpoint**: *nada*, `sm`, `md`, `lg`, `xl`, `xxl` — vale **daquele tamanho
  para cima**
- **tamanho**: `0`=0, `1`=.25rem, `2`=.5rem, `3`=1rem, `4`=1.5rem, `5`=3rem, `auto`

Lendo o que já existe no projeto:

- `me-1` → margin-**e**nd (direita) de .25rem — o respiro entre ícone e texto
- `py-4` → padding vertical de 1.5rem
- `mb-0` → zera a margem de baixo que o navegador dá ao `<h1>`
- `col-md-6` → metade da largura **a partir** de 768px; abaixo disso, linha inteira

O mesmo esqueleto vale para `text-{cor}`, `bg-{cor}`, `d-{valor}` (display),
`justify-content-{valor}`, `gap-{0..5}`. A página **Utilities → API** lista todas
as famílias geradas.

Duas mudanças da 5.3 que aparecem em tutoriais velhos como o formato antigo:

- `text-bg-success` substitui o par `bg-success text-white` (calcula o contraste)
- `ms-`/`me-` substituem `ml-`/`mr-` desde a v5 (suporte a idiomas RTL)

> Mais detalhes e o caminho inverso (do CSS renderizado para a página da doc) em
> [FRONTEND.md](FRONTEND.md).

## D — Customizar seguindo a documentação oficial

A seção **Customize** descreve quatro níveis, do mais profundo ao mais
superficial. A escolha certa depende de **quando** a mudança precisa acontecer.

### Nível 1 — Variáveis Sass (`Customize → Sass`)

Muda o valor **antes** do Bootstrap compilar. É o nível certo para identidade
visual: troca uma variável, o framework inteiro se recompila.

Onde achar a lista: `node_modules/bootstrap/scss/_variables.scss` — ~1500 linhas,
todas terminando em `!default`, que significa "use este valor **se ninguém
definiu antes**". É esse mecanismo que permite o override.

```scss
// Antes de importar o Bootstrap:
$primary:        #13b497;
$border-radius:  7.4px;
$font-family-base: 'Poppins', system-ui, sans-serif;
```

Requer Sass instalado — ver
[FRONTEND.md](FRONTEND.md).

### Nível 2 — Mapas Sass (`Customize → Color`, "Add to map")

Variável cria um valor. **Mapa** cria uma família inteira de classes. Adicionar
uma cor ao `$theme-colors` gera de uma vez `.btn-brand`, `.btn-outline-brand`,
`.text-brand`, `.bg-brand`, `.border-brand`, `.link-brand`, `.alert-brand` e a
variável CSS `--bs-brand`.

A ordem é rígida — o mapa precisa existir antes de ser mesclado, e a mesclagem
precisa acontecer antes de `maps`:

```scss
@use 'sass:map';

@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/variables-dark';

$theme-colors: map.merge($theme-colors, (
    'brand': #13b497,
));

@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';
@import 'bootstrap/scss/bootstrap';
```

### Nível 3 — CSS Variables (`Customize → CSS variables`)

A grande novidade da 5.3: **cada componente expõe suas próprias variáveis CSS**.
Você customiza um componente isolado sem tocar em Sass e sem lutar com
especificidade.

Abra qualquer página de componente e role até o fim — há uma seção **"CSS"**
listando as variáveis daquele componente. O `.card`, por exemplo, expõe
`--bs-card-bg`, `--bs-card-border-color`, `--bs-card-spacer-y`, `--bs-card-cap-bg`.

```css
/* Um card de destaque no dashboard, sem recompilar nada */
.card-metrica {
    --bs-card-border-color: #13b497;
    --bs-card-cap-bg: rgba(19, 180, 151, .1);
}
```

É o nível certo para **variações pontuais**. Use quando o valor precisar mudar em
runtime (tema, preferência do usuário) — variável Sass não existe mais no
browser, variável CSS sim. É também o mecanismo por trás do `data-bs-theme="dark"`.

### Nível 4 — Utility API (`Utilities → API`)

Gera classes utilitárias suas com a mesma fórmula do Bootstrap:

```scss
@import 'bootstrap/scss/utilities';

$utilities: map.merge($utilities, (
    'cursor': (
        property: cursor,
        class: cursor,
        values: pointer not-allowed,
    ),
));

@import 'bootstrap/scss/utilities/api';
```

Gera `.cursor-pointer` e `.cursor-not-allowed`. Também dá para **estender** um
utilitário existente (adicionar valores a `opacity`) ou **desligar** famílias
inteiras que você não usa, reduzindo o bundle — assunto de `Customize → Optimize`.

### A regra de decisão

| Situação | Nível |
|---|---|
| Cor/fonte/raio da marca, vale no site todo | 1 — variável Sass |
| Quero `.btn-brand` e toda a família | 2 — mapa Sass |
| Um componente específico fica diferente | 3 — CSS variable |
| Preciso da mesma regra em 5 lugares | 4 — Utility API |
| Nada disso serve | classe própria num partial `resources/scss/_tela.scss` |

**O que nunca fazer:** editar `node_modules/bootstrap/`. Some no próximo
`npm install`.

## E — Próximos níveis

Quando os 22 passos estiverem de pé, os degraus seguintes, do mais simples ao
mais trabalhoso:

- **Enum PHP** para o status (`app/Enums/ClienteStatus.php` + cast no model) —
  troca as strings soltas `'ativo'`/`'inativo'`/`'prospecto'` por um tipo
- **Busca e filtro** — um `<input>` no topo da tabela + `router.get` com
  `preserveState`, e `->when($request->busca, ...)` no controller
- **Ordenação por coluna** — `<th>` clicável
- **Layout persistente** — `Index.layout = (page) => <AppLayout>{page}</AppLayout>`
  no lugar do `<AppLayout>` dentro do `return`: a navbar deixa de ser recriada a
  cada clique (doc do Inertia: *The Basics → Layouts*)
- **`components/Paginacao.jsx`** — extrair a paginação quando surgir a segunda lista
- **Soft deletes** — lixeira em vez de exclusão definitiva
- **Policy** (`php artisan make:policy ClientePolicy --model=Cliente`) — "só quem
  criou pode editar"
- **Dropdown de ações** (`components/dropdowns/`) no lugar dos dois botões da
  linha — precisa de JS: estado do React ou `react-bootstrap` (Apêndice C.4)
- **Toast** (`components/toasts/`) no lugar do alerta de flash — idem

## F — Resumo dos arquivos

| Arquivo | Papel | Passos |
|---|---|---|
| `database/migrations/*_create_clientes_table.php` | Estrutura da tabela. | 1, 2 |
| `app/Models/Cliente.php` | `#[Fillable]` com as cinco colunas. | 1, 3 |
| `database/factories/ClienteFactory.php` | Dados falsos para o seeder e os testes. | 1, 4 |
| `database/seeders/ClienteSeeder.php` | 35 registros para ver a paginação. | 1, 4 |
| `routes/web.php` | Grupo `auth` com o dashboard e o `Route::resource`. | 5 |
| `app/Http/Controllers/ClienteController.php` | 6 métodos: os GET terminam em `render`, os que gravam em `redirect`. | 1, 6, 12, 16, 19 |
| `app/Http/Requests/StoreClienteRequest.php` | Validação da criação. | 1, 13 |
| `app/Http/Requests/UpdateClienteRequest.php` | Validação da edição, com `Rule::unique()->ignore()`. | 1, 17 |
| `app/Http/Middleware/HandleInertiaRequests.php` | Compartilha `flash.success`. | 15 |
| `resources/js/layouts/AppLayout.jsx` | Navbar + `<main>` + alerta de flash. Lê `auth` e `flash` com `usePage()`. | 8, 15 |
| `resources/js/pages/Dashboard.jsx` | Perde a navbar própria e passa a se embrulhar no `AppLayout`. | 8 |
| `resources/js/pages/Clientes/Index.jsx` | Tabela, badge, paginação, lápis e modal de exclusão (estado `alvo`). | 7, 9, 10, 11, 18, 20 |
| `resources/js/pages/Clientes/Form.jsx` | Criar e editar na mesma tela: com ou sem a prop `cliente`. | 14, 18 |
| `resources/scss/_layout.scss` | Cor da navbar, vinda do `_dashboard.scss`. | 8 |
| `resources/scss/_dashboard.scss` | Perde a navbar e o fundo: sobra só o `h1`. | 8 |
| `resources/scss/app.scss` | Ganha o `@import 'layout'`. | 8 |
| `tests/Pest.php` | `RefreshDatabase` ligado. | 21 |
| `tests/Feature/ClienteCrudTest.php` | Criação, duplicidade, bloqueio de visitante. | 21 |

O conteúdo **inteiro** de cada um destes arquivos está no Apêndice A, agrupado
em A.1 backend, A.2 frontend, A.3 estilos e A.4 testes.
