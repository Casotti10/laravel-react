import { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';

export default function Login() { // Inertia::render('Auth/Login') resolve para este arquivo
    const [showPassword, setShowPassword] = useState(false); // só visual, não vai pro servidor

    const { data, setData, post, processing, errors, reset } = useForm({ // as chaves precisam bater com as regras do LoginRequest
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault(); // sem isto o navegador recarrega a página e mata o SPA

        post('/login', { // CSRF é automático: o Inertia lê o cookie XSRF-TOKEN
            onFinish: () => reset('password'), // roda no sucesso e no erro
        });
    }

    return ( // um componente só devolve um nó raiz
        <>
            <Head title="Login — CRM" /> {/* injeta no <head> real, fora do #app */}

            <div className="login-bg d-flex justify-content-center align-items-center min-vh-100 p-3">
                <div className="login-card overflow-hidden">
                    <div className="row g-0"> {/* g-0 = colunas coladas, sem gutters */}

                        {/* col-md-6: metade a partir de 768px, empilha abaixo disso */}
                        <div className="col-lg-6 login-panel-dark text-white d-flex flex-column justify-content-center align-items-center">
                            <img src="/images/crm.png" alt="" className="login-logo" /> {/* alt vazio: decorativa */}

                            <div className="login-subtitle w-100 px-3 mb-2"> {/* px-3 soma ao padding do painel */}
                                <h4 className="m-0 text-light">CRM</h4>
                                <p>Gestão de relacionamento com cliente.</p>
                                <p className="mt-3">Todos os direitos reservado - Diretriz</p>
                                <p>Versão - <span className="login-version">4.8.10</span></p>
                            </div>
                        </div>

                        <div className="col-md-6 bg-white login-panel-form">
                            <img
                                src="/images/diretriz.png"
                                alt="Diretriz - systems & results"
                                className="login-brand mb-2"
                            />
                            <p className="login-frase mb-4">Faça o login inserindo as informações abaixo</p>

                            <form onSubmit={submit} noValidate> {/* noValidate: as mensagens vêm do Laravel */}
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label" /* htmlFor liga o label ao id */>
                                        <i className="bi bi-file-person me-1"></i>
                                        E-mail<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        className={`form-control login-input ${errors.email ? 'is-invalid' : ''}`} // is-invalid = borda vermelha
                                        value={data.email} // value + onChange = controlled component
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Digite seu e-mail"
                                        autoComplete="username"
                                        autoFocus
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>} {/* só renderiza se houver erro */}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        <i className="bi bi-key me-1"></i>
                                        Senha<span className="text-danger">*</span>
                                    </label>

                                    <div className="position-relative"> {/* âncora para o botão do olho */}
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'} // é só isso que o "mostrar senha" faz
                                            className={`form-control login-input pe-5 ${errors.password ? 'is-invalid' : ''}`} // pe-5: espaço pro ícone
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Digite sua senha"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button" // sem type, <button> dentro de form vira submit
                                            className="btn border-0 bg-transparent position-absolute top-50 end-0 translate-middle-y text-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1} // tira do fluxo do Tab
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
                                            checked={data.remember} // checkbox usa checked, não value
                                            onChange={(e) => setData('remember', e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="remember">Lembrar-me</label>
                                    </div>
                                    <a href="#" className="login-link">Esqueceu sua senha ?</a> {/* TODO: virar <Link> quando a tela existir */}
                                </div>

                                <div className="text-end">
                                    <button type="submit" className="btn login-btn" disabled={processing} /* disabled evita duplo envio */>
                                        <i className="bi bi-door-open me-1"></i>
                                        {processing ? 'Entrando...' : 'Entrar'}
                                    </button>
                                </div>
                            </form>

                            <p className="mt-4 mb-0 login-frase">
                                Não tem conta? <Link href="/register" className="login-link">Cadastre-se</Link> {/* <Link> navega por XHR, <a> recarregaria tudo */}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
