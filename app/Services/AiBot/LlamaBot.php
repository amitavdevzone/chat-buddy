<?php

namespace App\Services\AiBot;

use App\Enums\SenderType;
use App\Models\Conversation;
use App\Models\Message;
use Exception;
use Illuminate\Support\Arr;
use OpenAI;
use OpenAI\Client;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
                'model' => 'deepseek-r1:8b',
                'messages' => $messages,
            ]);

            $finalMessage = '';
            foreach ($stream as $response) {
                echo "data: {$response->choices[0]->toArray()['delta']['content']}\n\n";
                $finalMessage .= $response->choices[0]->toArray()['delta']['content'];
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

        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
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

    public function getUsageData(array $response): array
    {
        return [
            'prompt_tokens' => Arr::get($response, 'usage.prompt_tokens'),
            'completion_tokens' => Arr::get($response, 'usage.completion_tokens'),
            'total_tokens' => Arr::get($response, 'usage.total_tokens'),
        ];
    }

    /**
     * @throws Exception
     */
    public function generateAndSaveSummary(Conversation $conversation): void
    {
        $summaryModel = config('services.llama.summary_model');

        if (! $summaryModel) {
            throw new \Exception('Summary model not configured.');
        }

        $recentMessages = Message::query()->where('conversation_id', $conversation->id)
            ->orderByDesc('id')
            ->take(2)
            ->get()
            ->pluck('message')
            ->toArray();

        $messages = [
            [
                'role' => 'system',
                'content' => 'You are an AI assistant. Your task is to summarise conversation concisely.
                    You should ensure that the key points of the conversation is captured in the summary.
                    When possible create a bullet list of the key points.
                    Do not try to make information up.',
            ],
            [
                'role' => 'user',
                'content' => "Your task is to summarise conversation concisely.
                    Here is the last bit of summary based on the conversation that happened so far {$conversation->summary}.
                    Here is the last question by the user: {$recentMessages[1]} and the answer
                    to that by the AI assistant is {$recentMessages[0]}.",
            ],
        ];

        $response = $this->getClient()->chat()->create([
            'model' => $summaryModel,
            'messages' => $messages,
        ]);

        $conversation->summary = Arr::get($response, 'choices.0.message.content');
        $conversation->save();
    }
}
