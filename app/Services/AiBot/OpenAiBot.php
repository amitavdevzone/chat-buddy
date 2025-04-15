<?php

namespace App\Services\AiBot;

use App\Models\Conversation;
use OpenAI;
use OpenAI\Client;

class OpenAiBot implements AiBotInterface
{
    public function getClient(): Client
    {
        $apiKey = config('openai.api_key');
        $orgKey = config('openai.organization');

        return OpenAI::factory()
            ->withApiKey($apiKey)
            ->withOrganization($orgKey)
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

    public function getCompletion(string $model, string $message): array
    {
        // Simulate a response from OpenAI API
        $response = [
            'model' => $model,
            'message' => "This is a simulated response for model: $model with message: $message",
        ];

        return $response;
    }

    public function getUsageData(array $response): array
    {
        // TODO: Implement getUsageData() method.
    }

    public function generateAndSaveSummary(Conversation $conversation): void
    {
        // TODO: Implement generateAndSaveSummary() method.
    }
}
