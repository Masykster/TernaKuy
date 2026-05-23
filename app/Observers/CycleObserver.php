<?php

namespace App\Observers;

use App\Models\Cycle;
use App\Services\TimelineService;

class CycleObserver
{
    /**
     * Handle the Cycle "created" event.
     */
    public function created(Cycle $cycle): void
    {
        app(TimelineService::class)->generateBroilerTimeline($cycle);
    }
}
