import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

createInertiaApp({  //inertia configura aplicaççao react
    // Define como encontrar a página React correspondente ao nome recebido
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.jsx`,
            import.meta.glob('./pages/**/*.jsx')
        ),

    // Configura onde e como a aplicação React será inicializada
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
