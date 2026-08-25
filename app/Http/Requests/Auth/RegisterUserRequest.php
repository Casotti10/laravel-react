<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * Regras de validação do cadastro.
 *
 * Este arquivo só valida. Quem cria o usuário e faz o login é o
 * RegisteredUserController — o Form Request nunca toca no banco para escrever.
 */
class RegisterUserRequest extends FormRequest
{
    /**
     * Qualquer visitante pode se cadastrar.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],

            // 'unique:'.User::class faz o Laravel resolver a tabela a partir do
            // model (users). Isso dispara um SELECT no banco durante a validação —
            // é a regra mais cara desta lista, por isso vem depois das baratas.
            'email' => ['required', 'string', 'email', 'max:255', 'unique:'.User::class],

            // 'confirmed' exige um segundo campo chamado password_confirmation
            // com valor idêntico. O nome é convenção fixa do Laravel: o input
            // no React PRECISA se chamar exatamente password_confirmation.
            //
            // Password::defaults() é a política de senha global da aplicação.
            // Sem customização em AppServiceProvider, hoje significa só "mín. 8".
            // Centralizar assim permite endurecer a regra em um lugar só depois:
            // Password::defaults(fn () => Password::min(10)->letters()->numbers());
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }
}
