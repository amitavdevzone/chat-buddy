import { Head, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import InputError from "@/components/input-error";

type ProviderForm = {
  name: string;
  url: string;
  type: string;
};

export default function ProviderCreate() {
  const {data, setData, errors} = useForm<Required<ProviderForm>>({
    name: '',
    url: '',
    type: '',
  });

  return (
    <AppLayout>
      <Head title="Create Provider"/>

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
          <div className='space-y-6'>
            <form className='space-y-6'>

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

                <InputError className="mt-2" message={errors.name}/>
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

                <InputError className="mt-2" message={errors.url}/>
              </div>

            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
