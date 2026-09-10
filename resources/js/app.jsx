// Ícones e fonte continuam entrando pelo JS de propósito: o CSS deles aponta para
// arquivos .woff2 com caminho relativo, e é o Vite que reescreve essas URLs e copia
// as fontes para public/build. O NOSSO Sass saiu daqui — quem compila agora é o
// `npm run sass`, que gera public/css/app.css, linkado no app.blade.php.
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
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
