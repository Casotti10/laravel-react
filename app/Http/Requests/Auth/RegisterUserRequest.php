<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/** Só valida o cadastro. Quem cria o usuário e faz o login é o RegisteredUserController. */
class RegisterUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // qualquer visitante pode se cadastrar
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:'.User::class], // unique dispara um SELECT: a regra mais cara, por isso vem depois das baratas
            'password' => ['required', 'confirmed', Password::defaults()], // confirmed exige um campo password_confirmation; Password::defaults() é a política global (hoje, mín. 8)
        ];
    }
}
