# CRUD de Clientes — Bootstrap oficial + Laravel + Inertia

> Aula prática usando o Dashboard como campo de treino. Constrói um cadastro de
> Clientes completo (listar, criar, editar, excluir) em Bootstrap puro, copiado
> da documentação oficial.
>
> Pré-requisitos já documentados:
> [FRONTEND.md](FRONTEND.md) (de onde vem cada classe),
> [criando-uma-pagina.md](criando-uma-pagina.md) (rota → controller → página),
> [AUTENTICACAO-BACKEND.md](AUTENTICACAO-BACKEND.md) (sessão e middleware `auth`).

---

## O plano

| # | Passo | Onde |
|---|---|---|
| 1 | Ligar o JS do Bootstrap | `resources/js/app.jsx` |
| 2 | Migration + model + factory + seeder | `database/` |
| 3 | Rodar migration e popular o banco | terminal |
| 4 | `Route::resource` + controller | `routes/web.php`, `app/Http/Controllers/` |
| 5 | Form Requests (validação) | `app/Http/Requests/` |
| 6 | Flash messages compartilhadas | `app/Http/Middleware/HandleInertiaRequests.php` |
| 7 | Layout com navbar reaproveitável | `resources/js/layouts/` |
| 8 | Tela de listagem (tabela, badge, modal) | `pages/Clientes/Index.jsx` |
| 9 | Tela de criar/editar (form, validação) | `pages/Clientes/Form.jsx` |

Backend primeiro, frontend depois. Quando a tela quebra, você quer ter certeza
de que o dado já estava certo.

---

# PARTE 1 — Como usar a documentação oficial do Bootstrap

## 1.1 O mapa do site

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
Components, CSS variables, Optimize. É a Parte 2 deste documento.

**Regra prática:** antes de escrever CSS, procure em *Utilities*. Antes de
montar HTML do zero, procure em *Components*. Você quase nunca precisa dos dois.

## 1.2 O fluxo de copiar da doc

Toda página de componente tem o mesmo formato: um exemplo renderizado e, abaixo,
o HTML num bloco com botão de copiar. O fluxo é sempre:

```
1. Abrir a pagina do componente
2. Clicar em "Copy" no bloco do exemplo mais proximo do que voce quer
3. Colar no JSX
4. Aplicar as 6 conversoes da tabela 1.3
5. Trocar textos fixos por variaveis do React ({cliente.nome})
6. Trocar href="#" por <Link href={...}> quando for navegacao interna
```

O passo 4 é mecânico. O 5 e o 6 são onde você pensa.

## 1.3 Tabela de conversão HTML → JSX

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
  (atributos `data-*` passam direto)
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

## 1.4 O JS do Bootstrap — passo obrigatório

Hoje o projeto importa só o **CSS** do Bootstrap. Isso significa que metade dos
componentes não funciona:

| Funcionam só com CSS | Precisam do JS |
|---|---|
| Buttons, Card, Table, Badge, Grid, Forms, Spinner, Progress, List group, Breadcrumb, **Pagination**, Alert (estático) | **Modal**, **Dropdown**, Offcanvas, Collapse, Navbar toggler, Tabs, Toast, Tooltip, Popover, Carousel, Alert dismissível |

Como o CRUD usa modal de confirmação, adicione no topo de `resources/js/app.jsx`:

```jsx
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // "bundle" = Bootstrap + Popper (posiciona dropdown/tooltip)
```

**Por que isso funciona com React**, mesmo com elementos que aparecem e somem: o
Bootstrap 5 registra os listeners de `data-bs-toggle` **no `document`**, por
delegação de eventos. Ele não precisa conhecer o botão no momento em que a
página carrega. Qualquer `<button data-bs-toggle="modal">` que o React renderizar
depois funciona sozinho.

**As duas exceções**, que a própria doc avisa: *tooltips* e *popovers* são
opt-in e precisam de inicialização manual (`new bootstrap.Tooltip(el)`). Deixe
para depois.

**A armadilha:** se o React desmontar um modal enquanto ele está aberto, sobra o
`.modal-backdrop` cinza travando a tela. A regra é nunca condicionar a
existência do modal (`{aberto && <div className="modal">}`); renderize o modal
**sempre** e deixe o Bootstrap controlar a visibilidade. É o padrão da Parte 4.

## 1.5 Decodificar um nome de classe

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

---

# PARTE 2 — Customizar seguindo a documentação oficial

A seção **Customize** descreve quatro níveis, do mais profundo ao mais
superficial. A escolha certa depende de **quando** a mudança precisa acontecer.

## Nível 1 — Variáveis Sass (`Customize → Sass`)

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

## Nível 2 — Mapas Sass (`Customize → Color`, "Add to map")

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

## Nível 3 — CSS Variables (`Customize → CSS variables`)

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

## Nível 4 — Utility API (`Utilities → API`)

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

## A regra de decisão

| Situação | Nível |
|---|---|
| Cor/fonte/raio da marca, vale no site todo | 1 — variável Sass |
| Quero `.btn-brand` e toda a família | 2 — mapa Sass |
| Um componente específico fica diferente | 3 — CSS variable |
| Preciso da mesma regra em 5 lugares | 4 — Utility API |
| Nada disso serve | classe própria em `pages/` |

**O que nunca fazer:** editar `node_modules/bootstrap/`. Some no próximo
`npm install`.

---

# PARTE 3 — O backend

## 3.1 Gerar os arquivos

```powershell
php artisan make:model Cliente --migration --factory --seed --controller --resource --requests --no-interaction
```

Um comando, sete arquivos. Confira as flags com `php artisan make:model --help`:

- `--migration` → `database/migrations/xxxx_create_clientes_table.php`
- `--factory` → `database/factories/ClienteFactory.php`
- `--seed` → `database/seeders/ClienteSeeder.php`
- `--controller --resource` → `ClienteController` já com os 7 métodos vazios
- `--requests` → `StoreClienteRequest` e `UpdateClienteRequest`, já injetados no
  controller

## 3.2 A migration

```php
// database/migrations/xxxx_create_clientes_table.php
public function up(): void
{
    Schema::create('clientes', function (Blueprint $table) {
        $table->id();
        $table->string('nome');
        $table->string('email')->unique();          // unique no banco: a validacao sozinha tem corrida de dois cadastros simultaneos
        $table->string('telefone', 20)->nullable();
        $table->string('empresa')->nullable();
        $table->string('status')->default('prospecto');
        $table->timestamps();                        // created_at e updated_at, mantidos pelo Eloquent
    });
}
```

```powershell
php artisan migrate
```

## 3.3 O model

```php
// app/Models/Cliente.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    /** @use HasFactory<\Database\Factories\ClienteFactory> */
    use HasFactory;

    /**
     * Campos liberados para preenchimento em massa.
     * Sem esta lista, Cliente::create() ignora tudo e salva um registro vazio.
     */
    protected $fillable = [
        'nome',
        'email',
        'telefone',
        'empresa',
        'status',
    ];
}
```

O Eloquent adivinha a tabela pelo plural do nome da classe: `Cliente` →
`clientes`. Bateu, não precisa de `$table`.

## 3.4 Factory e seeder — para ter dados na tela

```php
// database/factories/ClienteFactory.php
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

```php
// database/seeders/ClienteSeeder.php
public function run(): void
{
    Cliente::factory()->count(35)->create(); // 35 para a paginacao de 10 ter 4 paginas
}
```

```powershell
php artisan db:seed --class=ClienteSeeder
```

## 3.5 As rotas

```php
// routes/web.php
use App\Http\Controllers\ClienteController;

Route::middleware('auth')->group(function () {           // agrupa em vez de repetir ->middleware('auth')
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

    Route::resource('clientes', ClienteController::class)->except(['show']);
});
```

Veja o que nasceu:

```powershell
php artisan route:list --path=clientes
```

| Verbo | URL | Método | Nome | Para quê |
|---|---|---|---|---|
| GET | `/clientes` | `index` | `clientes.index` | listar |
| GET | `/clientes/create` | `create` | `clientes.create` | form de novo |
| POST | `/clientes` | `store` | `clientes.store` | gravar novo |
| GET | `/clientes/{cliente}` | `show` | `clientes.show` | detalhe (removido pelo `except`) |
| GET | `/clientes/{cliente}/edit` | `edit` | `clientes.edit` | form de edição |
| PUT/PATCH | `/clientes/{cliente}` | `update` | `clientes.update` | gravar edição |
| DELETE | `/clientes/{cliente}` | `destroy` | `clientes.destroy` | excluir |

Entender essa tabela é entender REST. Repare: `/clientes` recebendo GET lista e
recebendo POST cria — **a URL é o recurso, o verbo é a ação**. É o mesmo
princípio do `/login` GET/POST que já existe no projeto.

## 3.6 O controller

```php
// app/Http/Controllers/ClienteController.php
namespace App\Http\Controllers;

use App\Http\Requests\StoreClienteRequest;
use App\Http\Requests\UpdateClienteRequest;
use App\Models\Cliente;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClienteController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Clientes/Index', [
            'clientes' => Cliente::latest()->paginate(10), // paginate devolve data + links prontos para o React
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Clientes/Form'); // sem prop "cliente" = modo criacao
    }

    public function store(StoreClienteRequest $request): RedirectResponse
    {
        Cliente::create($request->validated()); // validated(): so o que passou pelas regras

        return redirect()->route('clientes.index')
            ->with('success', 'Cliente cadastrado com sucesso.'); // flash: vive uma requisicao so
    }

    public function edit(Cliente $cliente): Response
    {
        // Route model binding: o Laravel viu o tipo Cliente e o {cliente} da URL,
        // buscou no banco e devolveu 404 sozinho se nao achar.
        return Inertia::render('Clientes/Form', [
            'cliente' => $cliente,
        ]);
    }

    public function update(UpdateClienteRequest $request, Cliente $cliente): RedirectResponse
    {
        $cliente->update($request->validated());

        return redirect()->route('clientes.index')
            ->with('success', 'Cliente atualizado.');
    }

    public function destroy(Cliente $cliente): RedirectResponse
    {
        $cliente->delete();

        return redirect()->route('clientes.index')
            ->with('success', 'Cliente excluído.');
    }
}
```

**O padrão POST-Redirect-GET:** todo método que grava termina em `redirect()`,
nunca em `Inertia::render()`. Sem isso, o F5 do usuário reenvia o formulário. O
Inertia segue o redirect sozinho e troca a página.

## 3.7 Os Form Requests

```php
// app/Http/Requests/StoreClienteRequest.php
public function authorize(): bool
{
    return true; // a rota ja exige 'auth'; autorizacao fina fica para uma Policy depois
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

```php
// app/Http/Requests/UpdateClienteRequest.php
use Illuminate\Validation\Rule;

public function rules(): array
{
    return [
        'nome' => ['required', 'string', 'max:255'],
        // Rule::unique ignorando o proprio registro - sem isso, salvar sem mudar
        // o e-mail acusa duplicado. $this->cliente e o model do route binding.
        'email' => ['required', 'email', 'max:255', Rule::unique('clientes')->ignore($this->cliente)],
        'telefone' => ['nullable', 'string', 'max:20'],
        'empresa' => ['nullable', 'string', 'max:255'],
        'status' => ['required', 'in:ativo,inativo,prospecto'],
    ];
}
```

Quando a validação falha, o Laravel redireciona de volta com os erros na sessão,
o Inertia os entrega no `errors` do `useForm`, e o React pinta o `is-invalid`.
Você não escreve nada para isso acontecer — já viu funcionando no `Register.jsx`.

## 3.8 Flash message compartilhada

```php
// app/Http/Middleware/HandleInertiaRequests.php - dentro de share()
'flash' => [
    'success' => fn () => $request->session()->get('success'), // fn(): so avaliado se a pagina for renderizada
],
```

Agora todo componente React recebe `flash.success` como prop compartilhada.

---

# PARTE 4 — O frontend, componente por componente

Cada bloco abaixo mostra: **de onde veio** → **HTML original da doc** → **o JSX
no seu projeto**.

## 4.1 Layout com a navbar

Extraia a navbar do `Dashboard.jsx` para reusar em todas as telas.

```jsx
// resources/js/layouts/AppLayout.jsx
import { Link, usePage } from '@inertiajs/react';

export default function AppLayout({ children }) {
    const { auth, flash } = usePage().props; // usePage le as props compartilhadas de qualquer profundidade

    return (
        <>
            <nav className="navbar navbar-dark bg-dark px-3">
                <Link href="/dashboard" className="navbar-brand mb-0">CRM</Link>

                <div className="d-flex align-items-center gap-3">
                    <Link href="/clientes" className="nav-link text-white-50">Clientes</Link>
                    <span className="text-white-50">{auth.user.name}</span>
                    <Link href="/logout" method="post" as="button" className="btn btn-sm btn-outline-light">
                        <i className="bi bi-box-arrow-right me-1"></i>Sair
                    </Link>
                </div>
            </nav>

            <main className="container py-4">
                {flash?.success && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        <i className="bi bi-check-circle me-2"></i>{flash.success}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
                    </div>
                )}
                {children}
            </main>
        </>
    );
}
```

> **Componente:** Alerts — `components/alerts/`, seção "Dismissing".
>
> **Original:** `<div class="alert alert-warning alert-dismissible fade show" role="alert">…<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
>
> **Mudou:** `class`→`className`, `alert-warning`→`alert-success`, texto→`{flash.success}`.
> O `data-bs-dismiss="alert"` colou intacto e funciona porque o bundle JS foi
> importado (1.4). `fade show` são as classes de transição — sem `show` o alerta
> nasce invisível.

## 4.2 A listagem

```jsx
// resources/js/pages/Clientes/Index.jsx
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

export default function Index({ clientes }) {
    const [alvo, setAlvo] = useState(null); // qual cliente o modal de exclusao esta mirando

    function excluir() {
        router.delete(`/clientes/${alvo.id}`); // router.delete: requisicao sem formulario
    }

    return (
        <AppLayout>
            <Head title="Clientes — CRM" />

            {/* Utilities de flex: empurra o botao para a direita e alinha na vertical */}
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
                                <tr key={cliente.id}> {/* key: como o React identifica cada linha entre renders */}
                                    <td>{cliente.nome}</td>
                                    <td>{cliente.email}</td>
                                    <td>{cliente.empresa ?? '—'}</td>
                                    <td>
                                        <span className={`badge ${
                                            cliente.status === 'ativo' ? 'text-bg-success'
                                            : cliente.status === 'inativo' ? 'text-bg-secondary'
                                            : 'text-bg-warning'
                                        }`}>
                                            {cliente.status}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <Link href={`/clientes/${cliente.id}/edit`} className="btn btn-sm btn-outline-secondary me-1">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            data-bs-toggle="modal"           // o Bootstrap abre o modal
                                            data-bs-target="#modalExcluir"
                                            onClick={() => setAlvo(cliente)} // o React guarda quem e
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

            {/* Paginacao */}
            <nav className="mt-3" aria-label="Paginação de clientes">
                <ul className="pagination justify-content-center">
                    {clientes.links.map((link, i) => (
                        <li key={i} className={`page-item ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}>
                            <Link
                                className="page-link"
                                href={link.url ?? '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }} // o Laravel manda &laquo; nas setas
                            />
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Modal - renderizado SEMPRE, o Bootstrap controla a visibilidade */}
            <div className="modal fade" id="modalExcluir" tabIndex={-1} aria-labelledby="tituloExcluir" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="tituloExcluir">Confirmar exclusão</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div className="modal-body">
                            Excluir <strong>{alvo?.nome}</strong>? Esta ação não pode ser desfeita.
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={excluir}>
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
```

Os quatro componentes usados aqui:

> **Tables** — `content/tables/`. Original: `<table class="table"><thead><tr><th scope="col">#</th>…`.
> Somados três modificadores da mesma página: `table-hover` (destaca a linha sob
> o mouse), `align-middle` (centraliza verticalmente — sem ele o badge fica
> desalinhado) e `.table-responsive` em volta (rola no celular em vez de estourar
> a tela). O `<tbody>` estático virou `.map()`.

> **Badge** — `components/badge/`. Original: `<span class="badge text-bg-primary">Primary</span>`.
> A classe de cor virou um ternário encadeado sobre `cliente.status`. É o padrão
> que se repete o tempo todo: **o Bootstrap dá o vocabulário, o React escolhe a
> palavra**.

> **Pagination** — `components/pagination/`. Original: `<nav><ul class="pagination"><li class="page-item"><a class="page-link" href="#">1</a></li>…`.
> O `<li>` estático virou `.map()` sobre `clientes.links`, que o `paginate(10)` do
> Laravel já entrega pronto com `url`, `label` e `active`. O `<a>` virou `<Link>`
> para navegar sem recarregar. `dangerouslySetInnerHTML` só porque o Laravel manda
> `&laquo;` como entidade HTML nas setas.

> **Modal** — `components/modal/`, variante "Vertically centered". Colado como
> está na doc, com quatro conversões: `class`, `tabindex`, tags fechadas, e o
> texto trocado por `{alvo?.nome}`. O `?.` evita quebrar no primeiro render,
> quando `alvo` ainda é `null`. Repare que **não há JS de abrir/fechar** —
> `data-bs-toggle` abre, `data-bs-dismiss` fecha, e o `onClick` do React só grava
> quem é o alvo. Os dois listeners disparam no mesmo clique.

## 4.3 O formulário (criar e editar na mesma tela)

```jsx
// resources/js/pages/Clientes/Form.jsx
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

export default function Form({ cliente }) {
    const editando = Boolean(cliente); // sem prop = criacao; com prop = edicao

    const { data, setData, post, put, processing, errors } = useForm({
        nome: cliente?.nome ?? '',
        email: cliente?.email ?? '',
        telefone: cliente?.telefone ?? '',
        empresa: cliente?.empresa ?? '',
        status: cliente?.status ?? 'prospecto',
    });

    function submit(e) {
        e.preventDefault();
        editando
            ? put(`/clientes/${cliente.id}`)  // PUT vai para update()
            : post('/clientes');              // POST vai para store()
    }

    return (
        <AppLayout>
            <Head title={editando ? 'Editar cliente' : 'Novo cliente'} />

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h1 className="h5 mb-0">{editando ? 'Editar cliente' : 'Novo cliente'}</h1>
                        </div>

                        <div className="card-body">
                            <form onSubmit={submit} noValidate> {/* noValidate: desliga a validacao do browser, quem manda e o Laravel */}
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
                                        <div className="input-group has-validation"> {/* has-validation: sem isso o feedback some dentro do input-group */}
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

> **Card** — `components/card/`. Original: `<div class="card"><div class="card-header">…</div><div class="card-body">…</div></div>`. Colado direto.

> **Grid** — `layout/grid/` e `layout/gutters/`. `row g-3` cria a linha com gutter
> 3 (1rem entre as colunas); `col-md-6` põe dois campos por linha a partir de
> 768px e um por linha no celular.

> **Form controls / Select / Input group** — `forms/form-control/`,
> `forms/select/`, `forms/input-group/`. Note `form-control` para `<input>` e
> **`form-select`** para `<select>` — trocar os dois é o erro mais comum de quem
> está começando.

> **Validation** — `forms/validation/`, seção "Server side". A doc diz
> literalmente para usar `.is-invalid` + `.invalid-feedback` quando a validação
> vem do servidor. É exatamente o nosso caso. O `has-validation` no `input-group`
> também está documentado ali — detalhe que só aparece quando o campo com erro
> está dentro de um grupo.

> **Spinner** — `components/spinners/`, variante "small".
> `spinner-border spinner-border-sm` dentro do botão, condicionado ao
> `processing` do `useForm`.

---

# PARTE 5 — Um teste, para fechar o ciclo

```powershell
php artisan make:test --pest ClienteCrudTest
```

```php
// tests/Feature/ClienteCrudTest.php
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

```powershell
php artisan test --compact --filter=ClienteCrudTest
```

Lembre do que o `CLAUDE.md` avisa: **os testes rodam em SQLite em memória, o app
roda em MySQL**. Garanta o `uses(RefreshDatabase::class);` em `tests/Pest.php`.

---

# PARTE 6 — Ordem de execução e próximos níveis

**Digite nesta ordem, testando a cada parada:**

1. `import 'bootstrap/dist/js/bootstrap.bundle.min.js'` no `app.jsx` → recarregue
   e confirme que um dropdown de teste abre
2. `make:model` com as flags → migration → `php artisan migrate`
3. Factory + seeder → `php artisan db:seed --class=ClienteSeeder` → confira com
   `php artisan tinker --execute 'App\Models\Cliente::count();'`
4. Rota + controller `index` só → acesse `/clientes` e veja o erro "página não
   encontrada" do Inertia. **Esse erro é bom sinal**: significa que o backend
   respondeu
5. `Clientes/Index.jsx` com a tabela crua, sem badge nem modal → a lista aparece
6. Paginação → badge → modal, um de cada vez
7. `store` + `Form.jsx` no modo criação
8. `edit`/`update` reusando o mesmo `Form.jsx`
9. `destroy` + flash message
10. `vendor/bin/pint --dirty --format agent` e `php artisan test --compact`

**Quando isso estiver de pé, os próximos degraus:**

- **Enum PHP** para o status (`app/Enums/ClienteStatus.php` + cast no model) —
  troca as strings soltas por um tipo
- **Policy** (`php artisan make:policy ClientePolicy --model=Cliente`) — "só quem
  criou pode editar"
- **Busca e filtro** — um `<input>` no topo da tabela + `router.get` com
  `preserveState`, e `->when($request->busca, ...)` no controller
- **Soft deletes** — lixeira em vez de exclusão definitiva
- **Ordenação por coluna** — `<th>` clicável
- **Dropdown de ações** (`components/dropdowns/`) no lugar dos dois botões da linha
- **Toast** (`components/toasts/`) no lugar do alert de flash

---

## Resumo dos arquivos envolvidos

| Arquivo | Papel |
|---|---|
| `resources/js/app.jsx` | Importa o bundle JS do Bootstrap (modal, dropdown). |
| `database/migrations/*_create_clientes_table.php` | Estrutura da tabela. |
| `app/Models/Cliente.php` | `$fillable`. |
| `database/factories/ClienteFactory.php` | Dados falsos para seeder e testes. |
| `database/seeders/ClienteSeeder.php` | 35 registros para ver a paginação. |
| `routes/web.php` | `Route::resource` dentro do grupo `auth`. |
| `app/Http/Controllers/ClienteController.php` | 6 métodos, todos terminando em render ou redirect. |
| `app/Http/Requests/{Store,Update}ClienteRequest.php` | Validação. `Rule::unique()->ignore()` no update. |
| `app/Http/Middleware/HandleInertiaRequests.php` | Compartilha `flash.success`. |
| `resources/js/layouts/AppLayout.jsx` | Navbar + container + alerta de flash. |
| `resources/js/pages/Clientes/Index.jsx` | Tabela, badge, paginação, modal. |
| `resources/js/pages/Clientes/Form.jsx` | Criar e editar na mesma tela. |
| `tests/Feature/ClienteCrudTest.php` | Criação, duplicidade, bloqueio de visitante. |
