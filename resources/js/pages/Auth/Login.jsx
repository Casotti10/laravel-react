import { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';

/*
 * Página de login.
 *
 * O nome do arquivo é o contrato com o backend: Inertia::render('Auth/Login')
 * no PHP resolve para resources/js/pages/Auth/Login.jsx. Renomear o arquivo
 * quebra a rota, mesmo sem nenhum erro de JavaScript.
 */
export default function Login() {
    // useState do React para o que é puramente visual: mostrar/ocultar a senha.
    // Isso não vai para o servidor, então não entra no useForm.
    const [showPassword, setShowPassword] = useState(false);

    /*
     * useForm é o hook do Inertia para formulários. Ele substitui o que seria
     * um useState por campo + um fetch manual + um estado de "carregando" +
     * um estado de erros. O objeto passado define os campos e os valores iniciais.
     *
     * - data:       valores atuais dos campos;
     * - setData:    atualiza um campo;
     * - post:       envia via POST (existe get, put, patch, delete também);
     * - processing: true enquanto a requisição está no ar — trava o botão;
     * - errors:     erros de validação vindos do 422 do Laravel, já por campo;
     * - reset:      volta campos ao valor inicial.
     *
     * As chaves aqui precisam bater com as regras do LoginRequest no PHP.
     */
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        // Sem isto o navegador faria o envio nativo do form e recarregaria a
        // página, matando o SPA. É obrigatório em qualquer form React.
        e.preventDefault();

        // Não precisa de token CSRF manual: o cliente HTTP do Inertia lê o
        // cookie XSRF-TOKEN e o reenvia no header sozinho.
        post('/login', {
            // onFinish roda no sucesso E no erro. Limpar a senha aqui evita
            // deixá-la no estado/DOM depois de uma tentativa falha.
            onFinish: () => reset('password'),
        });
    }

    return (
        // Fragmento <>...</>: um componente React só devolve um nó raiz, e o
        // <Head> não deve ficar dentro da <div> do layout.
        <>
            {/* <Head> injeta no <head> do documento de verdade, fora do #app. */}
            <Head title="Login — CRM" />

            <div className="login-bg d-flex justify-content-center align-items-center min-vh-100 p-3">
                <div className="login-card overflow-hidden">
                    {/* row g-0 = grid do Bootstrap sem gutters (colunas coladas) */}
                    <div className="row g-0">

                        {/* Painel escuro. col-md-6 = metade da largura a partir de
                            768px e largura total abaixo disso (empilha no celular). */}
                        <div className="col-md-6 login-panel-dark text-white d-flex flex-column">
                            {/* alt="" é intencional: imagem decorativa, leitores de
                                tela devem pular. Só use alt vazio quando a imagem
                                não carrega informação nenhuma. */}
                            <img
                                src="/images/crm.png"
                                alt=""
                                className="mb-4 mx-auto d-block"
                                style={{ width: '250px' }}
                            />

                            {/* mt-auto empurra este bloco para o fim do flex container */}
                            <div className="mt-auto">
                                <h4 className="fw-medium mb-1">CRM</h4>
                                <p className="login-subtitle mb-4">Gestão de relacionamento com cliente.</p>
                                <div className="login-subtitle">
                                    Todos os direitos reservado - Diretriz<br />
                                    Versão - <span className="login-version">4.8.10</span>
                                </div>
                            </div>
                        </div>

                        {/* Painel do formulário */}
                        <div className="col-md-6 bg-white login-panel-form">
                            <img
                                src="/images/diretriz.png"
                                alt="Diretriz - systems & results"
                                className="mb-2"
                                style={{ width: '200px' }}
                            />
                            <p className="login-frase mb-4">Faça o login inserindo as informações abaixo</p>

                            {/* noValidate desliga a validação nativa do navegador para
                                que todas as mensagens venham do Laravel — uma fonte só
                                de verdade, e em português. */}
                            <form onSubmit={submit} noValidate>
                                <div className="mb-3">
                                    {/* htmlFor (não "for") liga o label ao input pelo id:
                                        clicar no texto foca o campo e o leitor de tela
                                        anuncia o rótulo certo. */}
                                    <label htmlFor="email" className="form-label">
                                        <i className="bi bi-file-person me-1"></i>
                                        E-mail<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        // Template string: acrescenta is-invalid (borda
                                        // vermelha do Bootstrap) só quando o campo tem erro.
                                        className={`form-control login-input ${errors.email ? 'is-invalid' : ''}`}
                                        // value + onChange = "controlled component": o React
                                        // é dono do valor, o input só reflete o estado.
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        autoComplete="username"
                                        autoFocus
                                    />
                                    {/* && curto-circuito: se errors.email for undefined, nada
                                        é renderizado. .invalid-feedback do Bootstrap só
                                        aparece quando um irmão anterior tem .is-invalid. */}
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        <i className="bi bi-key me-1"></i>
                                        Senha<span className="text-danger">*</span>
                                    </label>

                                    {/* position-relative: âncora para o botão do olho,
                                        que fica em position-absolute dentro dela. */}
                                    <div className="position-relative">
                                        <input
                                            id="password"
                                            // Alternar o type entre password e text é
                                            // literalmente tudo que o "mostrar senha" faz.
                                            type={showPassword ? 'text' : 'password'}
                                            // pe-5: espaço à direita pro texto não passar
                                            // por baixo do ícone.
                                            className={`form-control login-input pe-5 ${errors.password ? 'is-invalid' : ''}`}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            // type="button" é essencial: dentro de um <form>,
                                            // <button> sem type vale como submit — clicar no
                                            // olho enviaria o formulário.
                                            type="button"
                                            className="btn border-0 bg-transparent position-absolute top-50 end-0 translate-middle-y text-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                            // tabIndex -1 tira do fluxo do Tab: quem termina de
                                            // digitar a senha quer chegar no botão Entrar.
                                            tabIndex={-1}
                                            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="remember"
                                            // Checkbox usa checked / e.target.checked,
                                            // não value / e.target.value.
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="remember">Lembrar-me</label>
                                    </div>
                                    {/* TODO: virar <Link href="/forgot-password"> quando a tela existir */}
                                    <a href="#" className="login-link">Esqueceu sua senha ?</a>
                                </div>

                                <div className="text-end">
                                    {/* disabled durante o envio impede o duplo clique
                                        que dispararia duas requisições de login. */}
                                    <button type="submit" className="btn login-btn" disabled={processing}>
                                        <i className="bi bi-door-open me-1"></i>
                                        {processing ? 'Entrando...' : 'Entrar'}
                                    </button>
                                </div>
                            </form>

                            <p className="mt-4 mb-0 login-frase">
                                {/* <Link> do Inertia, não <a>: navega por XHR trocando só o
                                    componente. Um <a> comum recarregaria a página inteira. */}
                                Não tem conta? <Link href="/register" className="login-link">Cadastre-se</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
