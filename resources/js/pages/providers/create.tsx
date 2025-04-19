import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type ProviderForm = {
  name: string;
  url: string;
  type: string;
};

export default function ProviderCreate() {
  const { data, setData, errors, processing, recentlySuccessful, post } = useForm<Required<ProviderForm>>({
    name: '',
    url: '',
    type: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route('providers.store'), {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout>
      <Head title="Create Provider" />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
          <div className="space-y-6">
            <form onSubmit={submit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>

                <Input
                  id="name"
                  className="mt-1 block w-full"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Full name"
                />

                <InputError className="mt-2" message={errors.name} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>

                <Input
                  id="url"
                  className="mt-1 block w-full"
                  value={data.url}
                  onChange={(e) => setData('url', e.target.value)}
                  required
                  autoComplete="url"
                  placeholder="Provider URL"
                />

                <InputError className="mt-2" message={errors.url} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Provider Type</Label>

                <select id="type" className="mt-1 block w-full" value={data.type} onChange={(e) => setData('type', e.target.value)} required>
                  <option value="">Select provider type</option>
                  <option value="openai" selected={data.type == 'openai'}>
                    OpenAI
                  </option>
                  <option value="llama" selected={data.type == 'llama'}>
                    Llama
                  </option>
                </select>

                <InputError className="mt-2" message={errors.type} />
              </div>

              <div className="flex items-center gap-4">
                <Button disabled={processing}>Save</Button>

                <Transition
                  show={recentlySuccessful}
                  enter="transition ease-in-out"
                  enterFrom="opacity-0"
                  leave="transition ease-in-out"
                  leaveTo="opacity-0"
                >
                  <p className="text-sm text-neutral-600">Saved</p>
                </Transition>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
