<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Cadastro de novos usuários.
 *
 * Mesmo par de métodos do controller de login: create() mostra o formulário,
 * store() processa. A diferença é que aqui o recurso criado é o próprio User.
 */
class RegisteredUserController extends Controller
{
    /**
     * Exibe o formulário de cadastro (resources/js/pages/Auth/Register.jsx).
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Cria o usuário e já o deixa logado.
     */
    public function store(RegisterUserRequest $request): RedirectResponse
    {
        // validated() devolve SÓ os campos que passaram pelas regras do Form Request.
        // Usar isto em vez de $request->all() evita mass assignment: se alguém
        // mandar "is_admin=1" no formulário, o campo nem aparece aqui.
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            // Sem Hash::make() de propósito: o model User tem o cast
            // 'password' => 'hashed', então o Eloquent hasheia sozinho ao salvar.
            // Chamar Hash::make() aqui geraria um hash de um hash.
            'password' => $validated['password'],
        ]);

        // Auth::login() recebe um objeto User já existente e grava na sessão.
        // Diferente de Auth::attempt(), que recebe credenciais e precisa conferir
        // a senha — aqui acabamos de criar o usuário, não há o que conferir.
        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
