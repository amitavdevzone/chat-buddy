<?php

namespace App\Services\AiBot;

use App\Enums\SenderType;
use App\Models\Conversation;
use App\Models\Message;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LlamaBot extends AbstractAiBot
{
    /**
     * @throws Exception
     */
    public function getModels(): Collection
    {
        $baseUrl = config('services.llama.base_url');
        $baseUrl = str_replace('v1', '', $baseUrl);

        try {
            $response = Http::get($baseUrl.'api/tags');

            return collect($response->json()['models'])->map(function ($model) {
                return [
                    'name' => $model['name'],
                    'family' => Arr::get($model, 'details.family'),
                    'parameter_size' => Arr::get($model, 'details.parameter_size'),
                    'modified_at' => Arr::get($model, 'modified_at'),
                ];
            });
        } catch (Exception $exception) {
            logger('Could not load models', ['exception' => $exception->getMessage()]);
            throw new Exception('Could not load models');
        }
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
                    'content' => 'You are a helpful and friendly assistant that always answers in a elaborate manner.
                    Ensure that you are not using any bad words or offensive language to answer.
                    Do not use more than 20 words to answer any question.',
                ],
                [
                    'role' => 'user',
                    'content' => "Answer to the question by the user: {$message}.
                    And the previous summary of the conversation is: {$conversation->summary}",
                ],
            ];

            $stream = $this->getClient()->chat()->createStreamed([
                'model' => 'gemma3:4b',
                'messages' => $messages,
            ]);

            $finalMessage = '';
            foreach ($stream as $response) {
                echo 'data: '.Arr::get($response->choices[0]->toArray(), 'delta.content', '')."\n\n";
                $finalMessage .= Arr::get($response->choices[0]->toArray(), 'delta.content', '');
                flush();
            }

            echo "data: [DONE]\n\n";
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
