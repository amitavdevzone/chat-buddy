<?php

namespace App\Http\Controllers;

use App\Models\Provider;
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

    public function create(): Response
    {
        return Inertia::render('providers/create');
    }
}
