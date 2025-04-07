<?php

namespace App\Providers;

use App\Services\AiBot\AiBotInterface;
use App\Services\AiBot\LlamaBot;
use App\Services\AiBot\OpenAiBot;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $aiBot = match (config('services.ai_provider')) {
            'openai' => OpenAiBot::class,
            default => LlamaBot::class,
        };

        $this->app->bind(AiBotInterface::class, $aiBot);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
