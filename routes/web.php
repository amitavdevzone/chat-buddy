<?php

use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ModelFetchController;
use App\Http\Controllers\ProviderController;
use App\Models\Conversation;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('conversation', [ConversationController::class, 'index'])->name('conversation.index');
    Route::post('message', [ConversationController::class, 'store'])->name('message.store');

    Route::get('respond', [ConversationController::class, 'respond'])->name('message.response');

    Route::resource('providers', ProviderController::class)
        ->only(['index', 'show', 'create', 'store']);

    Route::get('model-fetch', ModelFetchController::class)->name('model.fetch');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::get('chat', function () {
    $conversations = Conversation::query()
        ->orderByDesc('updated_at')
        ->get();

    return Inertia::render('gpt/index', ['conversations' => $conversations]);
})->name('chat');

Route::get('chat/{conversation}', function (Conversation $conversation) {
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
})->name('chat.conversation');
