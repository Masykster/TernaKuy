<?php

namespace App\Policies;

use App\Models\Farm;
use App\Models\User;

class FarmPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Farm $farm): bool
    {
        return $user->id === $farm->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Farm $farm): bool
    {
        return $user->id === $farm->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Farm $farm): bool
    {
        return $user->id === $farm->user_id;
    }
}
