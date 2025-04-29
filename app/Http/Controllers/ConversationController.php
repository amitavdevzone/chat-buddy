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
        $defaultModel = $models[1];

        $conversations = Conversation::query()
            ->orderByDesc('updated_at')
            ->get();

        return Inertia::render('gpt/index', [
            'models' => $models,
            'tools' => $tools,
            'defaultModel' => $defaultModel,
            'conversations' => $conversations,
        ]);
    }

    public function show(Conversation $conversation)
    {
        $conversations = Conversation::query()
            ->orderByDesc('updated_at')
            ->get();

        $conversation->load(['messages' => function ($query) {
            $query->orderBy('created_at', 'desc')->limit(30);
        }]);

        return Inertia::render('gpt/conversation', [
            'conversation' => $conversation,
            'conversations' => $conversations,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'model' => 'required|string',
            'conversation_id' => 'required|numeric|exists:conversations,id',
            'message' => 'required|string',
            'tool' => 'nullable|string',
        ]);

        Message::create([
            'conversation_id' => $data['conversation_id'],
            'user_id' => auth()->user()->id,
            'sender_type' => SenderType::USER->value,
            'message' => $data['message'],
        ]);
    }

    public function respond(Request $request, AiBotInterface $aiBot): StreamedResponse
    {
        $data = $request->validate([
            'message' => 'required|string',
            'conversation_id' => 'required|numeric|exists:conversations,id',
        ]);

        $conversation = Conversation::find($data['conversation_id']);

        return $aiBot->getStreamedCompletion($data['message'], $conversation);
    }
}
