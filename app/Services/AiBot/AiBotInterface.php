<?php

namespace App\Services\AiBot;

use App\Models\Conversation;
use Illuminate\Support\Collection;
use OpenAI\Client;
use Symfony\Component\HttpFoundation\StreamedResponse;

interface AiBotInterface
{
    public function getClient(): Client;

    public function getModels(): Collection;

    public function getCompletion(string $model, string $message): array;

    public function getStreamedCompletion(string $message, Conversation $conversation): StreamedResponse;

    public function getUsageData(array $response): array;

    public function generateAndSaveSummary(Conversation $conversation): void;
}
