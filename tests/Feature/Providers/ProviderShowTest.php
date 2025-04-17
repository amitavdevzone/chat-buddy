<?php

use App\Models\Provider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

describe('Provider show test', function () {
    it('provider details is visible to logged in user', function () {
        $provider = Provider::factory()->create();

        get(route('providers.show', ['provider' => $provider->id]))
            ->assertRedirectToRoute('login');
    });

    it('shows page to authenticated user', function () {
        $provider = Provider::factory()->create();

        actingAs(User::factory()->create());

        get(route('providers.show', ['provider' => $provider->id]))->assertOk();
    });
});
