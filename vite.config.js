import { defineConfig } from 'vite';
import laravel, { refreshPaths } from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import inertia from '@inertiajs/vite';

// O Vite aqui cuida só do JS e do CSS de vendor (ícones e Poppins, importados no
// app.jsx). O Sass do projeto é compilado fora, pelo CLI: veja o script "sass"
// no package.json. Por isso não há mais css.preprocessorOptions neste arquivo.
export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.jsx'],
            // refreshPaths = o padrão do plugin (views, rotas, lang...). O extra é
            // o CSS gerado: quando o Sass CLI reescreve o arquivo, a página recarrega.
            refresh: [...refreshPaths, 'public/css/app.css'],
        }),
        react(),
        inertia(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
