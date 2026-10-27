// resources/js/pages/Clientes/Index.jsx
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

// Fixo: não depende de props nem de estado, então mora fora do componente.
const corDoStatus = {
    ativo: 'bg-success-subtle text-success',
    inativo: 'bg-danger-subtle text-danger',
    prospecto: 'bg-warning-subtle text-warning-emphasis',
};

const formatarRotulo = (label) => {
    if (label.includes('Previous')) {
        return '&laquo; Anterior';
    }
    if (label.includes('Next')) {
        return 'Próximo &raquo;';
    }
    return label;
};

export default function Index({ clientes }) {
    return (
        <AppLayout>
            <Head title="Clientes — CRM" />

            {/* Utilities de flex: título à esquerda, botão à direita */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 mb-0 text-black">Clientes</h1>
                <Link href="/clientes/create" className="btn btn-primary">
                    <i className="bi bi-plus-lg me-1"></i>Novo cliente
                </Link>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                        <tr>
                            <th scope="col">Nome</th>
                            <th scope="col">E-mail</th>
                            <th scope="col">Empresa</th>
                            <th scope="col">Status</th>
                            <th scope="col">Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {clientes.data.map((cliente) => (
                            <tr key={cliente.id}>
                                <td>{cliente.nome}</td>
                                <td>{cliente.email}</td>
                                <td>{cliente.empresa ?? '—'}</td>
                                <td>
                                    <span className={`badge text-capitalize ${corDoStatus[cliente.status] ?? 'text-bg-secondary'}`}>
                                        {cliente.status}
                                    </span>

                                    <td>
                                        <Link
                                            href={`/clientes/${cliente.id}/edit`}
                                            className="btn btn-sm btn-outline-secondary me-1"
                                            aria-label={`Editar ${cliente.nome}`}
                                        >
                                            <i className="bi bi-pencil-fill"></i>
                                        </Link>
                                    </td>
                                </td>
                            </tr>
                        ))}

                        {clientes.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center text-muted py-5">
                                    Nenhum cliente cadastrado ainda.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {clientes.last_page > 1 && (  // Só mostra a paginação se existir mais de uma página
                <nav className="mt-3" aria-label="Paginação de clientes">
                    <ul className="pagination justify-content-center">  {/* Lista dos botões de paginação */}
                        {clientes.links.map((link, indice) => (
                            <li key={indice} className={`page-item ${link.active ? 'active' : ''} ${link.url ? '' : 'disabled'}`}>

                                {link.url ? (
                                    <Link href={link.url}
                                          className="page-link"
                                          dangerouslySetInnerHTML={{  __html: formatarRotulo(link.label) }} />
                                ) : (
                                    <span className="page-link" dangerouslySetInnerHTML={{  __html: formatarRotulo(link.label) }} />
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

            )}

        </AppLayout>
    );
}
