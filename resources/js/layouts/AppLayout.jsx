import { Link, usePage } from '@inertiajs/react';

// Moldura das telas logadas. Não é página: nenhum controller faz render('AppLayout').
// Quem usa é a página, embrulhando o próprio conteúdo.
export default function AppLayout({ children }) {
    const { url, props } = usePage(); // url = endereço atual; props = as compartilhadas
    const { auth, flash } = props;

    return (
        <div className="app-layout">
            {/* navbar-expand sem breakpoint: sempre aberta, sem botão hambúrguer (que pediria o JS do Bootstrap) */}
            <nav className="navbar navbar-expand">
                <div className="container-fluid">
                    {/* Barra no início do src: sem ela, em /clientes/5/edit o navegador procura /clientes/5/images/... */}
                    <Link href="/dashboard" className="navbar-brand">
                        <img src="/images/diretrsiz.png" alt="Diretriz" width="40" height="40" />
                    </Link>

                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link href="/dashboard" className={`nav-link ${url.startsWith('/dashboard') ? 'active' : ''}`}>
                                Dashboard
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/clientes" className={`nav-link ${url.startsWith('/clientes') ? 'active' : ''}`}>
                                Clientes
                            </Link>
                        </li>
                    </ul>

                    <span className="navbar-text me-3">{auth.user.name}</span>

                    <Link href="/logout" method="post" as="button" className="btn btn-sm btn-outline-dark">
                        <i className="bi bi-box-arrow-right me-1"></i>Sair
                    </Link>
                </div>
            </nav>

            <main className="container py-4">
                {flash.sucess && (
                    <div className="alert alert-success" role="alert">
                        <i className="bi bi-check-circle me-2"></i>
                        {flash.success}
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
