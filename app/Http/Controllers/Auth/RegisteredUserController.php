<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/** Cadastro de usuários: create() mostra o formulário, store() processa. */
class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register'); // resolve para resources/js/pages/Auth/Register.jsx
    }

    public function store(RegisterUserRequest $request): RedirectResponse
    {
        $validated = $request->validated(); // só os campos que passaram pelas regras: evita mass assignment de "is_admin=1"

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'], // sem Hash::make(): o cast 'hashed' do model User já hasheia
        ]);

        Auth::login($user); // recebe um User pronto; quem confere credenciais é o Auth::attempt()
        return redirect()->route('login');
    }
}
