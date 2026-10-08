<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreClienteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;     //nasce false = 403 em todo cadastro. A rota já exige login; permissão fina fica para uma Policy

    }

    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:clientes,email'],
            'telefone' => ['nullable', 'string', 'max:20'],
            'empresa' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:ativo,inativo,prospecto'],
        ];
    }
}
