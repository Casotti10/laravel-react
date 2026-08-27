import '../css/app.css'; // o CSS entra pelo JS: assim o Vite serve uma representação só do arquivo
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

// Único ponto de entrada do React. Ele não sabe quais páginas existem:
// quem escolhe é o Laravel, mandando o nome em Inertia::render('Auth/Login').
createInertiaApp({
    resolve: (name) => // recebe o nome vindo do PHP e devolve o componente
        resolvePageComponent(
            `./pages/${name}.jsx`,
            import.meta.glob('./pages/**/*.jsx') // caminho literal: o Vite gera este mapa em tempo de build, e cada página vira um chunk separado
        ),

    setup({ el, App, props }) { // el = a <div> deixada pelo app.blade.php; props = dados da primeira página
        createRoot(el).render(<App {...props} />); // daqui pra frente toda navegação é XHR, sem reload
    },
});
