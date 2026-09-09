import { Head, Link } from '@inertiajs/react';


export default  function Dashboard({auth}) {
    return  (
        <>
            <Head title="Dashboard — CRM" />

            <nav className="navbar navbar-dark bg-dark px-3">
                <span className="navbar-brand mb-0">CRM</span>

                <div className="d-flex align-items-center gap-3">
                    <span className="text-white-50">{auth.user.name}</span>

                    {/* method="post" + as="button": o Inertia monta um POST com CSRF.
                        Um <a> comum mandaria GET e a rota de logout recusa. */}
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="btn btn-sm btn-outline-light"
                    >
                        <i className="bi bi-box-arrow-right me-1"></i>Sair
                    </Link>
                </div>
            </nav>

            <main className="container py-4">
                <h1 className="h4">Bem-vindo, {auth.user.name}</h1>
                <p className="text-muted">{auth.user.email}</p>
            </main>
        </>
    )
}
