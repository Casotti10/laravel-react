# Backend de autenticação — contrato atual e como o front vai consumi-lo

Este documento descreve **o que já está construído** no backend de autenticação
(rotas, controllers, Form Requests) e o contrato que o front-end React vai
precisar respeitar para conversar com ele. Não cobre as páginas React nem as
rotas `GET` de renderização — isso ainda não existe no projeto e é assunto da
próxima aula (ver seção [Pendências conhecidas](#pendências-conhecidas)).

## Estado atual em uma frase

Três rotas `POST`, sem nenhuma página para exibi-las ainda: cadastro, login e
logout, todos autenticando por **sessão de cookie** (não é uma API com token).

```
php artisan route:list --except-vendor

POST register .. Auth\RegisteredUserController@store
POST login ..... Auth\AuthenticatedSessionController@store   (throttle:6,1)
POST logout .... Auth\AuthenticatedSessionController@destroy (auth)
```

## Autenticação por sessão, não por token

Não há Sanctum, JWT ou `Authorization: Bearer` neste projeto. O fluxo é o
"monolito clássico" do Laravel:

1. `Auth::attempt()` / `Auth::login()` gravam o ID do usuário autenticado na
   **sessão do servidor** (guard `web`, driver de sessão padrão do `.env`).
2. O navegador guarda só um cookie de sessão (`laravel_session`) — opaco,
   sem dado nenhum dentro.
3. Em toda requisição seguinte, o Laravel lê esse cookie, recupera a sessão no
   backend e sabe quem está logado. Não existe "token" pra o front armazenar
   ou reenviar manualmente em cada requisição.
4. `App\Models\User` (`../app/Models/User.php`) tem o cast
   `'password' => 'hashed'` — qualquer `User::create(['password' => '123456'])`
   já grava o hash automaticamente. Nenhum controller chama `Hash::make()` à mão.

Isso importa pro front porque o `useForm` do Inertia (próxima aula) não precisa
gerenciar token nenhum: o cookie de sessão + CSRF (próxima seção) resolvem tudo
sozinhos, desde que a requisição seja same-origin — que é sempre o caso aqui,
já que o React é servido pelo mesmo Laravel via Vite.

## CSRF — resolvido automaticamente pelo Inertia

Toda rota `POST/PUT/PATCH/DELETE` do grupo `web` passa pelo middleware
`PreventRequestForgery` (novo no Laravel 13, sucessor do antigo
`VerifyCsrfToken`). Ele funciona em duas camadas:

1. Primeiro olha o header `Sec-Fetch-Site`, que o navegador manda sozinho.
   Se indicar que a requisição é *same-origin*, libera direto — é exatamente
   o caso de um `fetch`/XHR disparado pelo próprio front Inertia.
2. Só cai pro método tradicional (comparar token) se essa verificação não for
   possível (navegador antigo, conexão não seguura, etc.).

Na camada tradicional, o Laravel expõe o token CSRF da sessão atual via um
cookie `XSRF-TOKEN`. O cliente HTTP embutido do Inertia (`@inertiajs/react`)
**lê esse cookie sozinho e manda de volta no header `X-XSRF-TOKEN`** em toda
requisição — sem precisar de `@csrf` no formulário nem de meta tag nenhuma.

**Conclusão prática:** nenhuma das páginas React que vamos criar precisa se
preocupar com CSRF manualmente. É só chamar `post('/login', data)` do
`useForm` e o Inertia cuida do resto.

## Rate limiting no login

```php
Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('throttle:6,1');
```

Máximo de 6 tentativas por minuto, contadas por combinação IP + rota (padrão
do Laravel). Na 7ª tentativa dentro da janela, a requisição nem chega no
controller: o Laravel devolve `429 Too Many Requests` direto. O front vai
precisar tratar esse status separadamente do 422 de validação (mensagens
diferentes: "muitas tentativas" vs. "credenciais inválidas").

## Contrato de cada endpoint

### `POST /register` — cadastro

| | |
|---|---|
| Controller | `RegisteredUserController::store` (`../app/Http/Controllers/Auth/RegisteredUserController.php`) |
| Form Request | `RegisterUserRequest` (`../app/Http/Requests/Auth/RegisterUserRequest.php`) |
| Middleware | nenhum extra (só o grupo `web`) |

**Payload esperado** (JSON ou form-data, tanto faz — o `useForm` do Inertia manda como o Laravel espera):

```json
{
  "name": "string, obrigatório, máx. 255",
  "email": "string, obrigatório, formato de e-mail, máx. 255, único na tabela users",
  "password": "string, obrigatório, precisa ter 'password_confirmation' igual, precisa passar em Password::defaults()",
  "password_confirmation": "string, obrigatório (implícito pela regra 'confirmed')"
}
```

`Password::defaults()` é a política de senha padrão do Laravel — hoje, sem
customização em `AppServiceProvider`, equivale só a "mínimo 8 caracteres".

**Fluxo no controller:**
```php
$user = User::create([...]);   // password já sai hasheado (cast do model)
Auth::login($user);            // usuário já entra logado, sem precisar logar de novo
return redirect('/');          // TODO no código: deveria ir para route('dashboard')
```

**Respostas possíveis:**
- **Sucesso:** `302` redirecionando para `/` (ver pendência abaixo — deveria ser `dashboard`). Como é uma navegação Inertia, o front não trata isso como um JSON de sucesso comum: o Inertia segue o redirect e troca de página sozinho.
- **Erro de validação:** `422`, com `page.props.errors` populado por campo, ex. `{ email: "The email has already been taken." }`. É isso que o `errors` do `useForm` vai expor.

### `POST /login`

| | |
|---|---|
| Controller | `AuthenticatedSessionController::store` |
| Form Request | `LoginRequest` (`../app/Http/Requests/Auth/LoginRequest.php`) |
| Middleware | `throttle:6,1` |

**Payload esperado:**
```json
{
  "email": "string, obrigatório, formato de e-mail",
  "password": "string, obrigatório"
}
```

**Fluxo no controller:**
```php
if (!Auth::attempt($request->validated())) {
    throw ValidationException::withMessages([
        'email' => 'As credenciais informadas não conferem com nossos registros.',
    ]);
}
$request->session()->regenerate(); // evita session fixation
return redirect('/');               // TODO: mesma pendência do register
```

**Respostas possíveis:**
- **Sucesso:** `302` para `/` (mesma pendência: deveria ser `dashboard`).
- **Credenciais erradas:** `422`, erro sempre na chave `email` (mesmo se a senha estiver errada — é assim que o Laravel evita revelar se o e-mail existe ou não).
- **Campos vazios:** `422` normal do `LoginRequest` (`email`/`password` "obrigatório").
- **Mais de 6 tentativas/minuto:** `429`, sem chegar a validar nada.

### `POST /logout`

| | |
|---|---|
| Controller | `AuthenticatedSessionController::destroy` |
| Form Request | nenhum (recebe `Request` puro) |
| Middleware | `auth` |

**Payload esperado:** nenhum — é só uma ação, sem corpo.

**Fluxo no controller:**
```php
Auth::logout();
$request->session()->invalidate();     // mata a sessão atual
$request->session()->regenerateToken(); // novo token CSRF (o antigo morreu junto com a sessão)
return redirect('/');
```

**Respostas possíveis:**
- **Sucesso:** `302` para `/`.
- **Usuário não autenticado:** o middleware `auth` intercepta *antes* de chegar no controller e tenta redirecionar para a rota nomeada `login`. **Essa rota ainda não existe** (ver pendências) — hoje, chamar `/logout` deslogado resulta em erro (`Route [login] not defined`), não em um redirect elegante.

## Pendências conhecidas

Este backend ainda não é navegável de ponta a ponta no navegador porque falta:

1. **Rotas `GET`** para renderizar as telas: `GET /register`, `GET /login`,
   `GET /dashboard` — hoje só existem as versões `POST` que *processam* os
   formulários, não as que *mostram* eles.
2. **Método `create()`** em `RegisteredUserController` e
   `AuthenticatedSessionController`, devolvendo `Inertia::render('Auth/Register')`
   / `Inertia::render('Auth/Login')`.
3. Os `redirect('/')` marcados com `// TODO` em `store()` de ambos os
   controllers precisam apontar para `redirect()->route('dashboard')` assim
   que essa rota existir.
4. Sem a rota nomeada `login`, o middleware `auth` (usado em `/logout`, e que
   será usado em `/dashboard`) não tem para onde mandar quem não está logado.
5. As páginas React em si (`resources/js/pages/Auth/Register.jsx`,
   `Login.jsx`, `resources/js/pages/Dashboard.jsx`) ainda não foram criadas.

Nada disso é bug — é só o que ainda falta pra fechar o fluxo visual. Os 3
endpoints documentados acima já estão corretos e testáveis isoladamente (por
exemplo com `curl` ou Pest) mesmo sem nenhuma página React existir.

## Como o front vai consumir isso (prévia)

Quando as páginas existirem, cada formulário React vai usar `useForm` do
`@inertiajs/react` apontando direto pro path da rota `POST`:

```jsx
const { data, setData, post, processing, errors } = useForm({ email: '', password: '' });
post('/login'); // sem token manual, sem @csrf manual — o Inertia cuida disso
```

- `errors.email`, `errors.password` etc. vêm prontos do `422` acima.
- Sucesso não devolve JSON pro front tratar "na mão" — é um redirect de verdade, que o Inertia segue trocando de página sozinho.
- `429` (throttle) **não** populate `errors` do jeito que `422` faz; se quisermos mostrar uma mensagem amigável pra "muitas tentativas", vai exigir tratamento à parte (ex. `onError` do `post()` verificando o status, ou uma página de erro customizada) — assunto pra quando chegarmos lá.

## Resumo dos arquivos envolvidos

| Arquivo | Papel |
|---|---|
| `../routes/web.php` | Define as 3 rotas `POST` (cadastro, login, logout) |
| `../app/Http/Controllers/Auth/RegisteredUserController.php` | Cria o usuário e já loga ele |
| `../app/Http/Controllers/Auth/AuthenticatedSessionController.php` | Autentica (`store`) e desautentica (`destroy`) |
| `../app/Http/Requests/Auth/RegisterUserRequest.php` | Regras de validação do cadastro |
| `../app/Http/Requests/Auth/LoginRequest.php` | Regras de validação do login |
| `../app/Models/User.php` | Cast `password => hashed`; define o que é `fillable`/`hidden` |
| `../bootstrap/app.php` | Registra o `HandleInertiaRequests` no grupo `web` (o `PreventRequestForgery` já vem por padrão do framework, não precisa ser registrado aqui) |
