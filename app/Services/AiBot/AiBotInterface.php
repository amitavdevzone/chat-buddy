<?php

namespace App\Services\AiBot;

use OpenAI\Client;

interface AiBotInterface
{
    public function getClient(): Client;

    public function getModels(): array;

    public function getCompletion(string $model, string $message): array;
}
