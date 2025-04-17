import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type BreadcrumbItem, Provider } from '../../types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Providers',
        href: route('providers.index'),
    },
];

export default function ProvidersList({ providers }: { providers: Array<Provider> }) {
    function renderProviderList() {
        return (
            <div>
                {providers.length > 0 &&
                    providers.map((provider: Provider) => (
                        <div key={provider.id} className="row my-2 flex justify-between rounded-xl border p-4">
                            <div className="flex flex-col gap-2">
                                <div>Name: {provider.name}</div>
                                <div>URL: {provider.url}</div>
                                <div>Type: {provider.type}</div>
                            </div>
                            <div>
                                <Link href={route('providers.show', provider.id)}>View ↠</Link>
                            </div>
                        </div>
                    ))}
            </div>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Providers list" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">{renderProviderList()}</div>
            </div>
        </AppLayout>
    );
}
