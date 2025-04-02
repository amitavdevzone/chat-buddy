<?php

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\StreamedResponse;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::get('/sse', function (Request $request) {
    return new StreamedResponse(function () {
        set_time_limit(0);
        if (ob_get_level() == 0) ob_start();
        // ob_implicit_flush(true);
        ob_end_clean();

        echo "data: Hello, this is the first message\n\n";
        echo "data: From the demo message\n\n";
        flush();

        $count = 0;
        while (true) {
            $count++;
            $now = now()->format('Y-m-d H:i:s');
            echo "data: Message, test @ $now -> $count\n\n";
            flush();
            logger('I was here');
            sleep(1);
        }

        // End of stream
        // echo "data: End of the stream\n\n";
        // flush();
    }, 200, [
        'Content-Type' => 'text/event-stream',
        'Cache-Control' => 'no-cache',
        'Connection' => 'keep-alive',
        'X-Accel-Buffering' => 'no'
    ]);
});

Route::view('sse-fe', 'sse');
