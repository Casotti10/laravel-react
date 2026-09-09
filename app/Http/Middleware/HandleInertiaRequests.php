<?php
namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{


    protected $rootView = 'app'; // Define a View principal do Inertia.

    public function version(Request $request): ?string
    {
        return parent::version($request); // Verifica a versão dos arquivos.
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request), // Mantém os dados padrão do Inertia.

            'auth' => [
                'user' => $request->user() ? [ // Verifica se há usuário logado.
                    'id' => $request->user()->id,       // ID
                    'name' => $request->user()->name,   // Nome
                    'email' => $request->user()->email, // E-mail
                ] : null, // Se não estiver logado, retorna null.
            ]
        ];
    }
}
