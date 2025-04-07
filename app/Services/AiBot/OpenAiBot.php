<?php

namespace App\Services\AiBot;

class OpenAiBot implements AiBotInterface
{
    public function getModels(): array
    {
        return [
            'gpt-4' => 'GPT-4',
            'gpt-3.5-turbo' => 'GPT-3.5',
            'custom' => 'Custom',
            'claude' => 'Claude',
            'bard' => 'Bard',
            'gemini' => 'Gemini',
        ];
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
