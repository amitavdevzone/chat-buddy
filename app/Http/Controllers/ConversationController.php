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
        $models = $aiBot->getModels()->pluck('name')->toArray();
        $tools = ['Web Search', 'Research'];
        $defaultModel = $models[0];

        $conversation = Conversation::query()
            ->where('id', 1)
            ->with(['messages' => function ($query) {
                $query->orderByDesc('id')
                    ->take(30);
            }])
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

        $conversation = Conversation::find(1);

        return $aiBot->getStreamedCompletion($message, $conversation);
    }
}
