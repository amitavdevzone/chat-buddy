<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Services\AiBot\AiBotInterface;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(AiBotInterface $aiBot): Response
    {
        $models = $aiBot->getModels();
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
