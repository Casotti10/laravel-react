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

            // 1. Dados de Autenticação
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                ] : null,
            ],

            'flash' => [
                'success' => fn() => $request->session()->get('success'),
            ],
        ];
    }
}
