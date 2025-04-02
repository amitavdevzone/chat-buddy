<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(): Response
    {
        $models = ['GPT-4', 'GPT-3.5', 'Custom', 'Claude', 'Bard', 'Gemini'];
        $tools = ['Web Search', 'Research'];

        return Inertia::render('chat/index', [
            'models' => $models,
            'tools' => $tools,
        ]);
    }
}
