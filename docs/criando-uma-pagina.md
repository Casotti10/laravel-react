# Criando uma página nova

Checklist do caminho completo — do backend ao browser. A ordem importa: cada passo
depende do anterior estar funcionando. Vale para qualquer tela deste projeto.

---

## O caminho da requisição

Entender isto evita 90% dos erros de "sumiu a página":

```
Browser  →  routes/web.php  →  Middleware  →  Controller  →  Inertia::render('Nome')
                                                                      ↓
Browser  ←  React monta o componente  ←  app.jsx resolve  ←  pages/Nome.jsx
```

O Laravel **nunca** devolve o HTML da página: ele devolve o *nome* de um componente
React mais um pacote de props. Quem monta a tela é o `app.jsx`, no navegador.

---

## Checklist

- [ ] 1. Rota em `routes/web.php` (URL + `->name()` + middleware)
- [ ] 2. Controller (ou closure, se não houver lógica)
- [ ] 3. Form Request — **só** se a tela envia dados (POST/PUT/PATCH)
- [ ] 4. Componente em `resources/js/pages/`
- [ ] 5. CSS próprio em `resources/css/` — só se o Bootstrap não bastar
- [ ] 6. Teste em `tests/Feature/`
- [ ] 7. `vendor/bin/pint --dirty` e conferir no browser

---

## 1. A rota

Toda tela começa aqui. Três decisões:

| Decisão | Pergunta | Exemplo |
|---|---|---|
| URL | o que o usuário digita | `/clientes` |
| Nome | como o PHP se refere a ela | `->name('clientes.index')` |
| Middleware | quem pode entrar | `->middleware('auth')` |

```php
Route::get('/clientes', [ClienteController::class, 'index'])
    ->middleware('auth')          // sem isto, qualquer visitante entra
    ->name('clientes.index');     // permite route('clientes.index') no PHP
```

**Sempre nomeie a rota.** Com nome, `redirect()->route('clientes.index')` continua
funcionando depois de você mudar a URL. Sem nome, você caça strings pelo projeto.

**Agrupe rotas que compartilham middleware** em vez de repetir a linha:

```php
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', ...)->name('dashboard');
    Route::get('/clientes', ...)->name('clientes.index');
});
```

### Verbos e nomes de método (convenção REST do Laravel)

Não invente nomes: o `make:controller --resource` já gera estes sete, e qualquer
dev Laravel sabe o que cada um faz de olhos fechados.

| Verbo | URL | Método | O que faz |
|---|---|---|---|
| GET | `/clientes` | `index` | lista |
| GET | `/clientes/criar` | `create` | mostra o formulário de criação |
| POST | `/clientes` | `store` | grava o novo |
| GET | `/clientes/{id}` | `show` | exibe um |
| GET | `/clientes/{id}/editar` | `edit` | mostra o formulário de edição |
| PUT | `/clientes/{id}` | `update` | grava a alteração |
| DELETE | `/clientes/{id}` | `destroy` | apaga |

Repare no par: `create` **mostra** o form, `store` **processa** — mesma URL, verbos
diferentes. Foi assim no login e no cadastro.

---

## 2. O controller

```bash
php artisan make:controller ClienteController --no-interaction
```

Precisa de um controller? Só se houver **lógica ou dados**. Tela estática pode ficar
numa closure na rota (como o `/dashboard` começou) — mas migre para controller assim
que aparecer a primeira consulta ao banco.

```php
<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Inertia\Inertia;
use Inertia\Response;

/** Uma frase dizendo do que esta classe cuida. */
class ClienteController extends Controller
{
    public function index(): Response      // Inertia\Response, não a do Laravel
    {
        return Inertia::render('Clientes/Index', [   // 1º arg: caminho do .jsx sem extensão
            'clientes' => Cliente::query()           // 2º arg: as props da página
                ->select(['id', 'nome', 'email'])    // só as colunas usadas na tela
                ->paginate(15),
        ]);
    }
}
```

Regras que este projeto segue:

- **Tipe o retorno.** `: Response` para tela, `: RedirectResponse` para gravação.
- **Nunca devolva o model inteiro.** `select()` explícito — sem isso qualquer coluna
  nova (CPF, telefone, salário) vaza pro JSON sem você notar.
- **Depois de gravar, redirecione** (`redirect()->route(...)`), não devolva JSON.
  O Inertia segue o 302 sozinho e a tela troca.

### Props da página × props compartilhadas

| | De onde vem | Chega em |
|---|---|---|
| Props da página | 2º argumento do `Inertia::render()` | só naquela tela |
| Props compartilhadas | `HandleInertiaRequests::share()` | **todas** as telas |

O usuário logado (`auth.user`) já é compartilhado — não passe de novo no controller.
Só adicione coisas ao `share()` se realmente forem necessárias em toda tela: ele roda
em **toda** requisição, e uma consulta pesada ali deixa o app inteiro lento.

---

## 3. O Form Request (só para telas que enviam dados)

```bash
php artisan make:request Cliente/StoreClienteRequest --no-interaction
```

Validação mora aqui, **nunca** no controller. O controller só roda se os dados já
passaram.

```php
class StoreClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;    // ou uma checagem de permissão de verdade
    }

    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:clientes'],  // regras caras (SELECT) por último
        ];
    }
}
```

No controller, use **sempre** `$request->validated()`, nunca `$request->all()`.
O `validated()` devolve só os campos que passaram pelas regras; o `all()` deixaria
um `is_admin=1` extra entrar por mass assignment.

Erros de validação voltam como 422 e caem sozinhos no `errors` do `useForm()` do
React. Você não escreve **nada** para isso funcionar.

---

## 4. A página React

O nome no `Inertia::render()` é o caminho dentro de `resources/js/pages/`:

| `Inertia::render(...)` | Arquivo |
|---|---|
| `'Dashboard'` | `resources/js/pages/Dashboard.jsx` |
| `'Auth/Login'` | `resources/js/pages/Auth/Login.jsx` |
| `'Clientes/Index'` | `resources/js/pages/Clientes/Index.jsx` |

**É sensível a maiúsculas** e não avisa direito quando erra: `'clientes/index'` dá
"Page not found" mesmo com o arquivo lá. Confira letra por letra.

Onde colocar: `pages/Auth/` é para as telas **de** autenticação (login, cadastro,
recuperar senha). Uma tela apenas **protegida por** login não vai ali — vai na raiz
ou na pasta do seu domínio (`pages/Clientes/`).

### Esqueleto

```jsx
import { Head, Link } from '@inertiajs/react';

// As props do Inertia::render() chegam desestruturadas no parâmetro.
export default function Index({ clientes, auth }) {   // export default é obrigatório
    return (
        <>
            <Head title="Clientes — CRM" />   {/* injeta no <head> real */}

            <div className="container py-4">
                <h1 className="h4">Clientes</h1>
            </div>
        </>
    );
}
```

### Navegação: `<Link>`, nunca `<a>`

```jsx
<Link href="/clientes">Clientes</Link>                       {/* XHR, mantém o SPA */}
<a href="/clientes">Clientes</a>                             {/* recarrega tudo — errado */}
<Link href="/logout" method="post" as="button">Sair</Link>   {/* POST com CSRF automático */}
```

Não existe `route()` no JavaScript deste projeto (o Ziggy não está instalado): no PHP
você usa `route('clientes.index')`, no React escreve a URL literal.

### Formulários: `useForm`

```jsx
const { data, setData, post, processing, errors, reset } = useForm({
    nome: '',      // as chaves precisam bater com as do Form Request
    email: '',
});

function submit(e) {
    e.preventDefault();                 // sem isto o browser recarrega e mata o SPA
    post('/clientes', {
        onSuccess: () => reset(),
    });
}
```

No input, `errors.nome` vira a classe `is-invalid` do Bootstrap mais a
`<div className="invalid-feedback">`. Copie o padrão do `Auth/Login.jsx`.

---

## 5. O CSS

Tente resolver só com classes do Bootstrap primeiro. Se precisar de estilo próprio,
crie um arquivo por tela e importe no fim do `app.css`:

```css
@import './clientes.css';   /* nosso tema por último, pra vencer o Bootstrap */
```

A ordem dos `@import` é o que decide quem ganha quando duas regras têm o mesmo peso.

---

## 6. O teste

```bash
php artisan make:test --pest ClienteIndexTest
```

O mínimo para uma tela protegida — dois casos:

```php
it('redireciona visitante para o login', function () {
    $this->get('/clientes')->assertRedirect('/login');
});

it('mostra a lista para quem está logado', function () {
    $user = User::factory()->create();      // factory, nunca User::create() no teste

    $this->actingAs($user)
        ->get('/clientes')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Clientes/Index'));
});
```

```bash
php artisan test --compact --filter=ClienteIndexTest
```

Lembre: os testes rodam em **SQLite em memória**, o app roda em **MySQL**. Um teste
verde não garante que a tela funciona no browser — abra e olhe.

---

## 7. Fechamento

```bash
vendor/bin/pint --dirty --format agent    # formata só o que você mexeu
npm run dev                               # deixe rodando enquanto edita o .jsx
```

Depois abra `http://login-crm.test/...` e confira de verdade.

---

## Armadilhas deste projeto

| Sintoma | Causa quase sempre |
|---|---|
| `Page not found: ./pages/X.jsx` | nome no `Inertia::render()` ≠ caminho do arquivo (maiúsculas!) |
| Tela em branco, nada no terminal | erro de JS — abra o console do navegador |
| A alteração no `.jsx` não aparece | `npm run dev` não está rodando |
| `Unable to locate file in Vite manifest` | falta `npm run build` (ou o dev server) |
| 419 no submit | sessão expirada — recarregue a página |
| 302 para `/login` sem motivo | o `auth` pegou; confira se você está logado |
| Prop chega `undefined` no React | erro de digitação na chave do `Inertia::render()` |

Nunca use `composer dev`: ele sobe um `php artisan serve` em cima do Herd, que já
serve o site. Só `npm run dev`.
