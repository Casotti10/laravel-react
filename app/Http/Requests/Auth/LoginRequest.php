<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request = validação tirada do controller e colocada numa classe própria.
 *
 * Quando um método de controller declara LoginRequest como parâmetro, o Laravel
 * roda authorize() e rules() ANTES de chamar o método. Se algo falhar, o
 * controller nunca executa e o usuário recebe 422 com os erros por campo.
 */
class LoginRequest extends FormRequest
{
    /**
     * Autorização (quem pode fazer esta requisição), não validação (o dado é válido).
     *
     * true porque qualquer visitante pode tentar logar. Em um request de
     * "editar post", aqui é onde entraria algo como
     * $this->user()->can('update', $this->post).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Regras de validação.
     *
     * Repare no que NÃO tem aqui: nada de 'min:8' na senha. Validar o formato da
     * senha no login é inútil (ela já existe no banco) e ainda vaza a política
     * de senha do sistema para quem está testando credenciais.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            // 'boolean' sem 'required': o checkbox desmarcado simplesmente não
            // é enviado pelo navegador, e isso é válido.
            'remember' => ['boolean'],
        ];
    }
}
