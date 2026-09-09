<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/** Controla a SESSÃO, não o usuário: criar a sessão = login, destruir = logout. */
class AuthenticatedSessionController extends Controller
{
    public function create(): Response // Inertia\Response: HTML na 1ª visita, JSON dentro do SPA
    {
        return Inertia::render('Auth/Login'); // caminho de componente: resources/js/pages/Auth/Login.jsx
    }

    public function store(LoginRequest $request): RedirectResponse // LoginRequest valida antes deste corpo rodar
    {
        // Auth::attempt() busca o usuário, compara a senha com o hash e grava o ID na sessão.
        if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) { // 2º argumento = lembrar-me
            throw ValidationException::withMessages([ // chega no React como erro 422 comum, sem tratamento especial
                'email' => 'As credenciais informadas não conferem com nossos registros.', // genérico de propósito: não confirma se o e-mail existe
            ]);
        }

        $request->session()->regenerate(); // novo ID de sessão: mata um session fixation plantado antes do login
        return redirect()->route('dashboard'); // redirect, não JSON: o Inertia segue o 302 sozinho
    }

    public function destroy(Request $request): RedirectResponse // Request puro: não há nada a validar
    {
        Auth::logout(); // tira o usuário do guard e apaga o cookie de lembrar-me

        $request->session()->invalidate(); // descarta o resto da sessão; o logout sozinho não faz isso

        $request->session()->regenerateToken(); // sem token novo, o próximo POST da mesma aba dá 419

        return redirect()->route('login');
    }
}
