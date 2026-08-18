<?php

use Illuminate\Foundation\Application; // Configura a aplicação
use Illuminate\Foundation\Configuration\Exceptions; // Configura exceções
use Illuminate\Foundation\Configuration\Middleware; // Configura middlewares
use Illuminate\Http\Request; // Representa uma requisição

return Application::configure(basePath: dirname(__DIR__)) // Inicia o Laravel
->withRouting( // Configura as rotas
    web: __DIR__.'/../routes/web.php', // Rotas web
    commands: __DIR__.'/../routes/console.php', // Comandos Artisan
    health: '/up', // Verifica se a aplicação está funcionando
)
    ->withMiddleware(function (Middleware $middleware): void { // Configura middlewares
        $middleware->web(append: [ // Adiciona ao grupo web
            \App\Http\Middleware\HandleInertiaRequests::class, // Middleware do Inertia
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void { // Configura erros
        $exceptions->shouldRenderJsonWhen( // Define quando retornar JSON
            fn (Request $request) => // Recebe a requisição
                $request->is('api/*') || $request->expectsJson(), // API ou espera JSON
        );
    })->create(); // Cria a aplicação
