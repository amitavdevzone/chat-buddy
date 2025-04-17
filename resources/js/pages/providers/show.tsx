import { Head } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';
import { BreadcrumbItem, Provider } from '../../types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Providers',
        href: route('providers.index'),
    },
    {
        title: 'Provider Details',
        href: '',
    },
];

export default function ShowProvider({ provider }: { provider: Provider }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Provider Details" />

            <div className="flex flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    <div className="space-y-2 rounded-xl border p-4">
                        <div>
                            <h1 className="text-4xl font-semibold text-gray-800">{provider.name}</h1>
                        </div>
                        <div>URL: {provider.url}</div>
                        <div>Type: {provider.type}</div>
                        <div>Created: {provider.created_at}</div>
                    </div>

                    <div className="text-right">
                        <button>Sync models</button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl p-4">Model list</div>
        </AppLayout>
    );
}
