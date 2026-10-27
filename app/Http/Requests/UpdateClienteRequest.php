<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClienteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            // Rule::unique ignorando o próprio registro — sem isso, salvar sem mudar
            // o e-mail acusa "já cadastrado". $this->cliente é o model do route binding.
            'email' => ['required', 'email', 'max:255', Rule::unique('clientes')->ignore($this->cliente)],
            'telefone' => ['nullable', 'string', 'max:20'],
            'empresa' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:ativo,inativo,prospecto'],
        ];
    }
}
