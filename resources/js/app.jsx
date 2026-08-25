import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

/*
 * Ponto de entrada do lado React.
 *
 * Só existe UM arquivo assim no projeto inteiro. Ele não sabe quais páginas
 * existem: quem decide qual componente renderizar é o Laravel, mandando o nome
 * da página em Inertia::render('Auth/Login'). Este arquivo só sabe traduzir
 * esse nome em um componente e montá-lo na tela.
 */
createInertiaApp({
    /*
     * resolve: recebe o nome vindo do PHP ('Auth/Login') e devolve o componente.
     *
     * import.meta.glob() é do Vite: no build ele varre a pasta e gera um mapa
     * { './pages/Auth/Login.jsx': () => import(...) }. Como cada valor é uma
     * função, cada página vira um chunk separado, baixado só quando visitada.
     *
     * Por isso o caminho precisa ser literal — se você escrever
     * import.meta.glob(variavel), o Vite não consegue analisar em tempo de build.
     */
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.jsx`,
            import.meta.glob('./pages/**/*.jsx')
        ),

    /*
     * setup: monta a aplicação React.
     *
     * - el:    a <div> que o <x-inertia::app /> do app.blade.php deixou no HTML;
     * - App:   o componente raiz do Inertia, que sabe trocar de página sem reload;
     * - props: os dados iniciais da primeira página, embutidos no HTML pelo servidor.
     *
     * Depois desta linha, toda navegação é XHR: o Laravel devolve só JSON com as
     * novas props, o Inertia troca o componente e o navegador nunca recarrega.
     */
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
