
import { Link, usePage } from '@inertiajs/react';

export default function AppLayout({ children }) {
    const { url, props } = usePage();
    const { auth, flash } = props;

    return (
        <div className="app-layout">
            <nav className="navbar navbar-expand">
                <div className="container-fluid">
                    <Link href="/dashboard" className="navbar-brand">
                        <img
                            src="/images/diretrsiz.png"
                            alt="Diretriz"
                            width="40"
                            height="40"
                        />
                    </Link>

                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link
                                href="/dashboard"
                                className={`nav-link ${
                                    url.startsWith('/dashboard') ? 'active' : ''
                                }`}
                            >
                                Dashboard
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link
                                href="/clientes"
                                className={`nav-link ${
                                    url.startsWith('/clientes') ? 'active' : ''
                                }`}
                            >
                                Clientes
                            </Link>
                        </li>
                    </ul>

                    <span className="navbar-text me-3">
                        {auth?.user?.name}
                    </span>

                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="btn btn-sm btn-outline-dark"
                    >
                        <i className="bi bi-box-arrow-right me-1"></i>
                        Sair
                    </Link>
                </div>
            </nav>

            <main className="container py-4">
                {flash?.success && (
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
