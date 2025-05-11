<?php

namespace App\Services\AiBot;

use App\Models\Conversation;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use OpenAI;
use OpenAI\Client;
use Symfony\Component\HttpFoundation\StreamedResponse;

abstract class AbstractAiBot implements AiBotInterface
{
    public function getClient(): Client
    {
        $baseUrl = config('services.llama.base_url');

        return OpenAI::factory()
            ->withBaseUri($baseUrl)
            ->make();
    }

    public function getModels(): Collection
    {
        $client = $this->getClient();
        $response = $client->models()->list();

        return collect($response['data'])->map(function ($model) {
            return [
                'name' => $model['id'],
            ];
        });
    }

    public function getCompletion(string $model, string $message): array
    {
        $messages = [
            [
                'role' => 'system',
                'content' => '
                You are a helpful and friendly assistant that always answers in a concise manner.
                Ensure that you are not using any bad words or offensive language to answer.
                Do not use more than 1000 words to answer any question.
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
            'usage' => $this->getUsageData($response->toArray()),
        ];
    }

    abstract public function getStreamedCompletion(string $message, Conversation $conversation, string $model): StreamedResponse;

    abstract public function getUsageData(array $response): array;

    abstract public function generateAndSaveSummary(Conversation $conversation): void;

    public function getStreamHeaders(): array
    {
        return [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ];
    }
}
