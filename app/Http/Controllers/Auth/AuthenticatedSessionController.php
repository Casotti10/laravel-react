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

/**
 * Controla a SESSÃO de autenticação — não o usuário.
 *
 * O nome vem do jeito REST de pensar: o recurso aqui é "a sessão logada".
 * Criar a sessão = login (store), destruir a sessão = logout (destroy).
 * Por isso não existe "LoginController" com um método logout().
 */
class AuthenticatedSessionController extends Controller
{
    /**
     * Exibe o formulário de login.
     *
     * O tipo de retorno é Inertia\Response (não Illuminate\Http\Response):
     * o Inertia decide sozinho se devolve o HTML completo (primeira visita)
     * ou só um JSON com as props (navegação dentro do SPA).
     */
    public function create(): Response
    {
        // 'Auth/Login' é um caminho de componente, não de arquivo PHP:
        // resolve para resources/js/pages/Auth/Login.jsx.
        return Inertia::render('Auth/Login');
    }

    /**
     * Processa a tentativa de login.
     *
     * Receber LoginRequest no lugar de Request faz o Laravel validar ANTES de
     * entrar no método. Se a validação falhar, este corpo nem executa —
     * o framework já devolve 422 com os erros.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Auth::attempt() faz três coisas de uma vez:
        //   1. busca o usuário pelo email;
        //   2. compara a senha enviada com o hash do banco (nunca em texto puro);
        //   3. se bater, grava o ID do usuário na sessão — ou seja, loga.
        // O 2º argumento é o "lembrar-me": quando true, o Laravel também
        // grava um cookie de longa duração com o remember_token.
        if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            // Erro de propósito genérico e sempre atribuído a 'email':
            // dizer "senha errada" confirmaria que o e-mail existe, o que ajuda
            // quem está enumerando contas. Lançar ValidationException faz o erro
            // chegar no front exatamente como um erro de validação normal (422),
            // então o React não precisa de tratamento especial.
            throw ValidationException::withMessages([
                'email' => 'As credenciais informadas não conferem com nossos registros.',
            ]);
        }

        // Troca o ID da sessão mantendo os dados dentro dela.
        // Protege contra "session fixation": se um atacante tivesse plantado
        // um ID de sessão no navegador da vítima antes do login, esse ID morre aqui.
        $request->session()->regenerate();

        // Redirect, não JSON. O Inertia segue o 302 e troca de página sozinho.
        return redirect()->route('dashboard');
    }

    /**
     * Encerra a sessão (logout).
     *
     * Recebe Request puro porque não há nada para validar — é só uma ação.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Remove o usuário do guard e apaga o cookie de "lembrar-me".
        Auth::logout();

        // Descarta TODO o conteúdo da sessão (flash messages, carrinho, o que houver).
        // Auth::logout() sozinho só tira a chave do usuário; isto limpa o resto.
        $request->session()->invalidate();

        // O token CSRF antigo morreu junto com a sessão. Sem gerar um novo,
        // o próximo POST da mesma aba falharia com 419 Page Expired.
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
