<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Rotas web
|--------------------------------------------------------------------------
|
| Tudo aqui entra automaticamente no grupo de middleware "web", que é quem
| liga sessão, cookies e proteção CSRF. É por isso que Auth::attempt() e
| $request->session() funcionam sem nenhuma configuração extra.
|
| Padrão que se repete em auth: cada tela tem DUAS rotas com a mesma URL —
| um GET que mostra o formulário e um POST que processa o envio. O verbo
| HTTP é o que diferencia as duas.
|
*/

// Home provisória — só prova que o Inertia está respondendo.
// Inertia::render('Teste') procura resources/js/pages/Teste.jsx e passa
// o array como props do componente React.
Route::get('/', function () {
    return Inertia::render('Teste', ['mensagem' => 'Inertia respondendo']);
});

// ---------------------------------------------------------------------------
// Cadastro de usuário
// ---------------------------------------------------------------------------

// GET: renderiza o formulário. ->name('register') registra um apelido pra rota,
// o que permite usar route('register') no PHP em vez de escrever a URL na mão —
// se a URL mudar amanhã, só este arquivo muda.
Route::get('/register', [RegisteredUserController::class, 'create'])
    ->name('register');

// POST: recebe os dados do formulário, valida e cria o usuário.
Route::post('/register', [RegisteredUserController::class, 'store']);

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

// O nome 'login' aqui é obrigatório, não decorativo: o middleware "auth"
// redireciona visitante não logado justamente pra rota chamada "login".
// Sem esse nome, o erro é "Route [login] not defined".
Route::get('/login', [AuthenticatedSessionController::class, 'create'])
    ->name('login');

// throttle:6,1 = no máximo 6 requisições por minuto, contadas por IP + rota.
// É defesa contra força bruta: na 7ª tentativa o Laravel devolve 429 antes
// mesmo de entrar no controller.
Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('throttle:6,1');

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

// POST (não GET) de propósito: logout altera estado do servidor, e links GET
// podem ser disparados por prefetch do navegador ou por uma <img> maliciosa.
// O middleware "auth" garante que só quem está logado chega no controller.
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

// ---------------------------------------------------------------------------
// Área logada
// ---------------------------------------------------------------------------

// Closure em vez de controller porque ainda não há lógica nenhuma aqui.
// Quando o dashboard precisar buscar dados, vira um DashboardController.
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware('auth')->name('dashboard');
