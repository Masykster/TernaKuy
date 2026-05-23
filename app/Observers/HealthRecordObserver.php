<?php

namespace App\Observers;

use App\Models\HealthRecord;
use Carbon\Carbon;

class HealthRecordObserver
{
    /**
     * Handle the HealthRecord "creating" event.
     */
    public function creating(HealthRecord $record): void
    {
        if ($record->record_type === 'treatment') {
            $record->withdrawal_end = Carbon::parse($record->record_date)
                ->addDays((int) $record->withdrawal_days)
                ->toDateString();
        } else {
            $record->withdrawal_end = null;
        }
    }
}
