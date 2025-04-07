<?php

namespace App\Services\AiBot;

use OpenAI;
use OpenAI\Client;

class LlamaBot implements AiBotInterface
{
    public function getClient(): Client
    {
        $baseUrl = config('services.llama.base_url');

        return OpenAI::factory()
            ->withBaseUri($baseUrl)
            ->make();
    }

    public function getModels(): array
    {
        $client = $this->getClient();
        $response = $client->models()->list();

        $models = collect($response['data'])->map(function ($model) {
            return $model['id'];
        });

        return $models->toArray();
    }

    public function getCompletion(string $model, string $message, ?string $tool = null): array
    {
        // Simulate a response from OpenAI API
        $response = [
            'model' => $model,
            'message' => "This is a simulated response for model: $model with message: $message",
            'tool' => $tool,
        ];

        return $response;
    }
}
