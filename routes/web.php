<?php

use App\Enums\SenderType;
use App\Http\Controllers\ConversationController;
use App\Models\Message;
use App\Services\AiBot\AiBotInterface;
use Illuminate\Http\Request;
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::post('message', function (Request $request, AiBotInterface $aiBot) {
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

    $response = $aiBot->getCompletion('gemma3:4b', $data['message']);
    Message::create([
        'conversation_id' => 1,
        'user_id' => auth()->user()->id,
        'sender_type' => SenderType::AGENT->value,
        'message' => $response['message'],
    ]);
})->name('message.store');
