<?php

namespace Database\Seeders;

use App\Enums\SenderType;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user = User::factory()->create([
            'name' => 'Amitav Roy',
            'email' => 'reachme@amitavroy.com',
            'password' => bcrypt(env('DEFAULT_PASSWORD')),
        ]);

        // Create 10 conversations for the user
        Conversation::factory(10)->create([
            'user_id' => $user->id,
        ])->each(function (Conversation $conversation) {
            // Generate between 50 to 100 messages for each conversation
            $messageCount = rand(50, 100);

            // Ensure the message count is even for perfect alternation
            if ($messageCount % 2 !== 0) {
                $messageCount++;
            }

            // Create the messages with alternating sender types
            for ($i = 0; $i < $messageCount; $i++) {
                // Even indexes (0, 2, 4...) are user messages, odd are agent messages
                $senderType = ($i % 2 === 0) ? SenderType::USER : SenderType::AGENT;

                Message::factory()->create([
                    'conversation_id' => $conversation->id,
                    'sender_type' => $senderType->value,
                    'created_at' => now()->addMinutes($i), // Sequential timing
                ]);
            }
        });
    }
}
