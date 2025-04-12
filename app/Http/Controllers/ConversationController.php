<?php

namespace App\Http\Controllers;

use App\Enums\SenderType;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\AiBot\AiBotInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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

        $response = $aiBot->getCompletion($data['model'], $data['message']);

        Message::create([
            'conversation_id' => 1,
            'user_id' => auth()->user()->id,
            'sender_type' => SenderType::AGENT->value,
            'message' => $response['message'],
        ]);
    }
}
