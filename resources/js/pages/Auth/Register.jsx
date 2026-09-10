import {useState} from 'react';
import { useForm, Head, Link } from '@inertiajs/react';

export default function Register() {        // Inertia::render('Auth/Register') resolve para este arquivo
    const [showPassword, setShowPassword] = useState(false);        //um estado só, compartilhado pelo dois campos de senha
    const { data, setData, post, processing, errors, reset } = useForm({           // as chaves precisam bater com as regras do RegisterUserRequest
        name : '',
        email: '',
        password: '',
        password_confirmation: '', //nome exigido pela regra "confirmed"
    });

    function submit(e) {
        e.preventDefault();
        post('/register',{
            onFinish: () => reset('password', 'password_confirmation'),  //reset aceita varios campos de uma vez
        });
    }

    return (
        <>
            <Head title="Cadastro — CRM" />

            <div className="login-bg d-flex justify-content-center align-items-center min-vh-100 p-3">
                <div className="login-card overflow-hidden">
                    <div className="row g-0">

                        <div className="col-md-6 login-panel-dark text-white d-flex flex-column justify-content-center
  align-items-center">
                            <img src="/images/crm.png" alt="" className="login-logo" />

                            <div className="login-subtitle w-100 px-3 mb-1">
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
                            <p className="login-frase mb-4">Preencha os dados abaixo para criar sua conta</p>
                            <form onSubmit={submit} noValidate>
                                <div className="mb-1">
                                    <label htmlFor="name" className="form-label">
                                        <i className="bi bi-person me-1"></i>
                                        Nome<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Digite seu nome"
                                        autoComplete="name"
                                        autoFocus
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                                <div className="mb-2">
                                    <label htmlFor="email" className="form-label">
                                        <i className="bi bi-file-person me-1"></i>
                                        E-mail<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Digite seu e-mail"
                                        autoComplete="username"
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>} {/* aqui cai o
  erro do unique */}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        <i className="bi bi-key me-1"></i>
                                        Senha<span className="text-danger">*</span>
                                    </label>

                                    <div className="position-relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            className={`form-control pe-5 ${errors.password ? 'is-invalid' : ''}`}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Mínimo de 8 caracteres"
                                            autoComplete="new-password" // new-password: avisa o gerenciador que é cadastro,
                                            não login
                                        />
                                        <button
                                            type="button"
                                            className="btn border-0 bg-transparent position-absolute top-50 end-0
  translate-middle-y text-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                        {errors.password && <div className="invalid-feedback">{errors.password}</div>} {/*
  cobre "mínimo 8" E "não confere" */}
                                    </div>
                                </div> <div className="mb-4">
                                <label htmlFor="password_confirmation" className="form-label">
                                    <i className="bi bi-key-fill me-1"></i>
                                    Confirmar senha<span className="text-danger">*</span>
                                </label>

                                <input
                                    id="password_confirmation"
                                    type={showPassword ? 'text' : 'password'} // mesmo estado do campo acima
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`} // só a borda: a mensagem já apareceu no campo anterior
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Repita a senha"
                                    autoComplete="new-password"
                                />
                            </div>

                                <div className="text-end">
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        <i className="bi bi-person-plus me-1"></i>
                                        {processing ? 'Cadastrando...' : 'Cadastrar'}
                                    </button>
                                </div>
                            </form>
                            <p className="mt-4 mb-0 login-frase">
                                Já tem conta? <Link href="/login" className="login-link">Entrar</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
