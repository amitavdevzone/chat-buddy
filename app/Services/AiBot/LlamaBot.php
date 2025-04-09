<?php

namespace App\Services\AiBot;

use Illuminate\Support\Arr;
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

    public function getCompletion(string $model, string $message): array
    {
        $messages = [
            [
                'role' => 'system',
                'content' => '
                You are a helpful and friendly assistant that always answers in a concise manner.
                Ensure that you are not using any bad words or offensive language to answer.
                Do not use more than 1000 tokens to answer any question.
                ',
            ],
            [
                'role' => 'user',
                'content' => $message,
            ],
        ];

        $response = $this->getClient()->chat()->create([
            'model' => $model,
            'messages' => $messages,
        ]);

        return [
            'id' => $response->id,
            'model' => $response->model,
            'message' => Arr::get($response, 'choices.0.message.content'),
            'response' => $response,
        ];
    }
}
