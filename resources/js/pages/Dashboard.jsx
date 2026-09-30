import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <>
            <Head title="Dashboard — CRM" />

            <div className="min-h-screen bg-white">

                {/* NavBar */}
                <nav className="w-full h-[60px] bg-slate-600">
                    <div className="flex items-center px-4 py-2">
                        <a href="#">
                            <img
                                src="/images/diretrsiz.png"
                                alt="Diretriz"
                                width="40"
                                height="40"
                            />
                        </a>
                    </div>
                </nav>

                {/* Conteúdo */}
                <main className="mx-auto w-full max-w-7xl px-4 py-3">
                    <h1 className="text-center font-semibold text-[#333]">
                        Bem-vindo, {auth.user.name}
                    </h1>
                </main>

            </div>
        </>
    );
}
