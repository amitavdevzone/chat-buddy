<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(): Response
    {
        $models = ['GPT-4', 'GPT-3.5', 'Custom', 'Claude', 'Bard', 'Gemini'];
        $tools = ['Web Search', 'Research'];
        $defaultModel = 'GPT-3.5';

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
}
