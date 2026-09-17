import { Head, Link } from '@inertiajs/react';


export default  function Dashboard({auth}) {
    return  (
        <>
            <Head title="Dashboard — CRM"/>

            <div className={"dashboard" }>
                <nav className="navbar">
                    <div className="container-fluid" >
                        <a className="navbar-brand" href="#">
                            <img src="images/diretrsiz.png" alt="" className="" width="40" height="40"/>

                        </a>
                    </div>
                </nav>

                <main className="container py-3">
                    <h1 className="h3 mt-3 text-center " >Bem-vindo, {auth.user.name}</h1>
                </main>
            </div>
        </>

    )
}
