<?php

use App\Enums\ProviderType;
use App\Models\Provider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

describe('Provider list test', function () {
    it('provider list is visible to logged in user', function () {
        get(route('providers.index'))
            ->assertRedirectToRoute('login');
    });

    it('shows page to authenticated user', function () {
        actingAs(User::factory()->create());

        get(route('providers.index'))->assertOk();
    });

    it('shows the providers list', function () {
        actingAs(User::factory()->create());

        Provider::factory()->create(['name' => 'Anthropic']);
        Provider::factory()->create(['name' => 'OpenAI']);

        get(route('providers.index'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('providers/index')
                ->has('providers', 2)
                ->where('providers.0.name', 'Anthropic')
            );
    });
});
