// resources/js/pages/Dashboard.jsx
import { Head } from '@inertiajs/react';
import AppLayout from '../layouts/AppLayout';

export default function Dashboard({ auth }) {
    return (
        <AppLayout>
            <Head title="Dashboard — CRM" />

            <div className="dashboard">
                <h1 className="h3 mt-3 text-center">Bem-vindo, {auth.user.name}</h1>
            </div>
        </AppLayout>
    );
}
