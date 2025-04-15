<?php

namespace App\Http\Controllers;

use App\Models\Provider;
use Inertia\Inertia;

class ProviderController extends Controller
{
    public function index()
    {
        $providers = Provider::query()
            ->orderBy('name')
            ->get();

        return Inertia::render('providers/index', [
            'providers' => $providers,
        ]);
    }
}
