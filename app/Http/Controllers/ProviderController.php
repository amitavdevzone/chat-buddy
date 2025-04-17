<?php

namespace App\Http\Controllers;

use App\Enums\ProviderType;
use App\Models\Provider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProviderController extends Controller
{
    public function index(): Response
    {
        $providers = Provider::query()
            ->orderBy('name')
            ->get();

        return Inertia::render('providers/index', [
            'providers' => $providers,
        ]);
    }

    public function show(Provider $provider): Response
    {
        return Inertia::render('providers/show', [
            'provider' => $provider,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('providers/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|min:3',
            'url' => 'required|url|max:255',
            'type' => ['required', 'string', Rule::enum(ProviderType::class)],
        ]);

        Provider::create([
            'name' => $data['name'],
            'url' => $data['url'],
            'type' => $data['type'],
        ]);

        return redirect()->route('providers.index')->with('success', 'Provider created successfully.');
    }
}
