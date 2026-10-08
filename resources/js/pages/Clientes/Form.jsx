// resources/js/pages/Clientes/Index.jsx
import {Head, Link, useForm} from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

export default function Form (){
    //AS CHAVES TEM DE SER IGUAIS AS DAS RULES() DOS StoreClienteRequest.
    const { data, setData, post, processing, errors} = useForm({
        nome: '',
        email: '',
        telefone: '',
        empresa: '',
        status: 'prospecto',
    });

    function submit(e){
        e.preventDefault();  //sem isso o navegador recarrega a pagina inteira
        post('/clientes'); // -> store()
    }

    return(
        <AppLayout>
            <Head title="Novo Cliente - CRM" />

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h1 className="h5 mb-0>">Novo cliente</h1>
                        </div>

                        {/* NOME*/}
                        <div className="card-body">  {/* noValidate: desliga a validação do navegador; quem valida é o Laravel */}
                            <form onSubmit={submit} noValidate>
                                <div className="row-cols-1">

                                    <div className="mb-4">
                                        <label htmlFor="nome " className="form-label"> Nome </label>
                                        <input
                                        id="nome "
                                        type="text "
                                        className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                                        value={data.nome}
                                        onChange={(e) => setData('nome', e.target.value)}
                                        autoFocus
                                        />
                                        {errors.nome &&
                                            <div className="invalid-feedback">{errors.nome}</div>}
                                    </div>

                                    {/* EMAIL */}
                                    <div className="mb-4">
                                        <label htmlFor="email" className="form-label"> Email </label>
                                        <input
                                            id="email"
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        {errors.email && (
                                            <div className="invalid-feedback"> {errors.email} </div>
                                        )}
                                    </div>

                                    {/* TELEFONE */}
                                    <div className="mb-4">
                                        <label htmlFor="email" className="form-label">Telefone </label>
                                        <input
                                            id="telefone"
                                            type="number"
                                            className={`form-control ${errors.telefone ? 'is-invalid' : ''}`}
                                            value={data.telefone}
                                            onChange={(e) => setData('telefone', e.target.value)}
                                        />
                                        {errors.telefone && (
                                            <div className="invalid-feedback"> {errors.telefone} </div>
                                        )}
                                    </div>

                                    {/* EMPRESA */}
                                    <div className="mb-4">
                                        <label htmlFor="Empresa" className="form-label">Empresa </label>
                                        <input
                                            id="empresa"
                                            type="text"
                                            className={`form-control' ${errors.empresa ? 'is-invalid' : ''}`}
                                            value={data.empresa}
                                            onChange={(e) => setData('telefone', e.target.value)}
                                        />
                                        {errors.empresa && (
                                            <div className="invalid-feedback"> {errors.empresa} </div>
                                        )}
                                    </div>

                                    {/*STATUS*/}
                                    <div className="mb-4 form-select">
                                        <label htmlFor="status" className="form-label">Status</label>
                                        <select
                                            id="status"
                                            className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                        >
                                            <option value="prospecto">Prospecto</option>
                                            <option value="ativo">Ativo</option>
                                            <option value="inativo">Inativo</option>
                                        </select>
                                        {errors.status &&
                                            <div className="invalid-feedback">{errors.status}</div>}
                                    </div>

                                    <div className="d-flex justify-content-end gap-2 mt-4">
                                        <Link href="/clientes"
                                              className="btn btn-outline-secondary">Cancelar</Link>
                                        <button type="submit" className="btn btn-primary"
                                                disabled={processing}>
                                            {processing &&
                                                <span className="spinner-border spinner-border-sm me-2"
                                                      aria-hidden="true"></span>}
                                            {processing ? 'Salvando...' : 'Salvar'}
                                        </button>
                                    </div>
                                </div>


                                        </form>
                                    </div>
                                </div>
                        </div>
                    </div>
        </AppLayout>
);
}
