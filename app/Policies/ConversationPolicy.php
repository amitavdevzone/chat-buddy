<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;
use Auth;
use Illuminate\Auth\Access\HandlesAuthorization;

class ConversationPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return false;
    }

    public function view(User $user, Conversation $conversation): bool
    {
        return $user->id === $conversation->user_id;
    }

    public function create(User $user): bool
    {
        return Auth::check();
    }

    public function update(User $user, Conversation $conversation): bool
    {
        return $user->id === $conversation->user_id;
    }

    public function delete(User $user, Conversation $conversation): bool
    {
        return $user->id === $conversation->user_id;
    }

    public function restore(User $user, Conversation $conversation): bool
    {
        return $user->id === $conversation->user_id;
    }

    public function forceDelete(User $user, Conversation $conversation): bool
    {
        return $user->id === $conversation->user_id;
    }
}
