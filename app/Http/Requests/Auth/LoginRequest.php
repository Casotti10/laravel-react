<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/** Validação tirada do controller: roda ANTES do método e devolve 422 se falhar. */
class LoginRequest extends FormRequest
{
    public function authorize(): bool // autorização (quem pode fazer), não validação (o dado é válido)
    {
        return true; // qualquer visitante pode tentar logar
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'], // sem min:8: validar formato no login é inútil e vaza a política de senha
            'remember' => ['boolean'], // sem required: checkbox desmarcado não é enviado pelo navegador
        ];
    }
}
