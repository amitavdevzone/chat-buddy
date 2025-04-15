<?php

namespace Database\Factories;

use App\Enums\ProviderType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Provider>
 */
class ProviderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->company(),
            'url' => $this->faker->unique()->url(),
            'type' => $this->faker->randomElement(ProviderType::values()),
        ];
    }
}
