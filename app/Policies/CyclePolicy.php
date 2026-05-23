<?php

namespace App\Policies;

use App\Models\Cycle;
use App\Models\User;

class CyclePolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Cycle $cycle): bool
    {
        return $user->id === $cycle->coop->farm->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Cycle $cycle): bool
    {
        return $user->id === $cycle->coop->farm->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Cycle $cycle): bool
    {
        return $user->id === $cycle->coop->farm->user_id;
    }
}
