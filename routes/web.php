<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware('auth')->name('dashboard'); // closure enquanto não há lógica; depois vira DashboardController
