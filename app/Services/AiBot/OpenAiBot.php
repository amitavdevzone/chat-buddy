<?php

namespace App\Services\AiBot;

use App\Enums\SenderType;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Support\Arr;
use OpenAI;
use OpenAI\Client;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OpenAiBot extends AbstractAiBot
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

    public function getCompletion(string $model, string $message): array
    {
        // Simulate a response from OpenAI API
        $response = [
            'model' => $model,
            'message' => "This is a simulated response for model: $model with message: $message",
        ];

        return $response;
    }

    public function getStreamedCompletion(string $message, Conversation $conversation): StreamedResponse
    {
        return new StreamedResponse(function () use ($message, $conversation) {
            set_time_limit(0);
            if (ob_get_level() == 0) {
                ob_start();
            }
            ob_end_clean();

            $messages = [
                [
                    'role' => 'system',
                    'content' => 'You are a helpful and friendly assistant that always answers in a concise manner.
                    Ensure that you are not using any bad words or offensive language to answer.
                    Do not use more than 1000 words to answer any question.',
                ],
                [
                    'role' => 'user',
                    'content' => "You are a helpful and friendly assistant that always answers in a concise manner.
                    Ensure that you are not using any bad words or offensive language to answer.
                    Answer to the question by the user: {$message}.
                    And the previous summary of the conversation is: {$conversation->summary}",
                ],
            ];

            $stream = $this->getClient()->chat()->createStreamed([
                'model' => 'gpt-4.1-nano-2025-04-14',
                'messages' => $messages,
            ]);

            $finalMessage = '';
            foreach ($stream as $response) {
                echo 'data: '.Arr::get($response->choices[0]->toArray(), 'delta.content', '')."\n\n";
                $finalMessage .= Arr::get($response->choices[0]->toArray(), 'delta.content', '');
                flush();
            }

            flush();

            Message::create([
                'conversation_id' => 1,
                'user_id' => auth()->user()->id,
                'sender_type' => SenderType::AGENT->value,
                'message' => $finalMessage,
            ]);

            $this->generateAndSaveSummary($conversation);

        }, 200, $this->getStreamHeaders());
    }

    public function getUsageData(array $response): array
    {
        return [];
    }

    public function generateAndSaveSummary(Conversation $conversation): void
    {
        // TODO: Implement generateAndSaveSummary() method.
    }
}
