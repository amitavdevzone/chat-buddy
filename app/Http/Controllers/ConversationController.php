<?php

namespace App\Http\Controllers;

use App\Enums\SenderType;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\AiBot\AiBotInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ConversationController extends Controller
{
    public function index(AiBotInterface $aiBot): Response
    {
        $models = $aiBot->getModels();
        $tools = ['Web Search', 'Research'];
        $defaultModel = $models[0];

        $conversation = Conversation::query()
            ->with(['messages' => function ($query) {
                $query->latest()->take(30);
            }])
            ->latest()
            ->first();

        return Inertia::render('chat/index', [
            'models' => $models,
            'tools' => $tools,
            'defaultModel' => $defaultModel,
            'conversation' => $conversation,
        ]);
    }

    public function store(Request $request, AiBotInterface $aiBot)
    {
        $data = $request->validate([
            'model' => 'required|string',
            'message' => 'required|string',
            'tool' => 'nullable|string',
        ]);

        Message::create([
            'conversation_id' => 1,
            'user_id' => auth()->user()->id,
            'sender_type' => SenderType::USER->value,
            'message' => $data['message'],
        ]);
    }

    public function respond(Request $request, AiBotInterface $aiBot): StreamedResponse
    {
        $message = $request->input('message');

        return new StreamedResponse(function () use ($message, $aiBot) {
            set_time_limit(0);
            if (ob_get_level() == 0) {
                ob_start();
            }
            ob_end_clean();

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

            $stream = $aiBot->getClient()->chat()->createStreamed([
                'model' => 'gemma3:4b',
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
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
