<?php

use App\Enums\SenderType;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ModelFetchController;
use App\Http\Controllers\ProviderController;
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

    Route::get('respond', [ConversationController::class, 'respond'])->name('message.response');

    Route::resource('providers', ProviderController::class)
        ->only(['index', 'show', 'create', 'store']);

    Route::get('model-fetch', ModelFetchController::class)->name('model.fetch');
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
})->name('message.store');
