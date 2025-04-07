<?php

namespace App\Services\AiBot;

interface AiBotInterface
{
    public function getModels(): array;

    public function getCompletion(string $model, string $message, ?string $tool = null): array;
}
