<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\post;

uses(RefreshDatabase::class);

describe('Provider create test', function () {
    it('provider list is visible to logged in user', function () {
        get(route('providers.create'))
            ->assertRedirectToRoute('login');
    });

    it('shows page to authenticated user', function () {
        actingAs(User::factory()->create());

        get(route('providers.create'))->assertOk();
    });

    it('needs required fields', function () {
        actingAs(User::factory()->create());

        post(route('providers.store'), [])
            ->assertSessionHasErrors(['name', 'url', 'type']);
    });

    it('creates a provider', function () {
        actingAs(User::factory()->create());

        $data = [
            'name' => 'Open AI',
            'url' => 'https://www.openai.com',
            'type' => 'openai',
        ];

        post(route('providers.store'), $data)
            ->assertRedirect(route('providers.index'));

        $this->assertDatabaseHas('providers', $data);
    });
});
