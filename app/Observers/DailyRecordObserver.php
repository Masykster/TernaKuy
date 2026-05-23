<?php

namespace App\Observers;

use App\Models\DailyRecord;
use App\Services\CalculationService;
use Carbon\Carbon;

class DailyRecordObserver
{
    /**
     * Handle the DailyRecord "creating" event.
     */
    public function creating(DailyRecord $dailyRecord): void
    {
        $cycle = $dailyRecord->cycle;
        if (!$cycle) {
            return;
        }

        // Get previous record before this record date
        $prevRecord = DailyRecord::where('cycle_id', $dailyRecord->cycle_id)
            ->where('record_date', '<', $dailyRecord->record_date)
            ->orderBy('record_date', 'desc')
            ->first();

        if ($prevRecord) {
            $prev = [
                'live_population' => $prevRecord->live_population,
                'cum_feed_kg' => $prevRecord->cum_feed_kg,
                'cum_mortality' => $prevRecord->cum_mortality,
            ];
        } else {
            $prev = [
                'live_population' => $cycle->doc_count,
                'cum_feed_kg' => 0.00,
                'cum_mortality' => 0,
            ];
        }

        // Calculate day_number
        $docDate = Carbon::parse($cycle->doc_date);
        $recordDate = Carbon::parse($dailyRecord->record_date);
        $dayNumber = $recordDate->diffInDays($docDate) + 1;
        if ($recordDate->isBefore($docDate)) {
            $dayNumber = 1;
        }
        $dailyRecord->day_number = $dayNumber;

        // Perform calculation
        $calcService = app(CalculationService::class);
        $computed = $calcService->calculateDaily([
            'feed_kg' => $dailyRecord->feed_kg,
            'mortality' => $dailyRecord->mortality,
            'avg_weight_g' => $dailyRecord->avg_weight_g,
        ], $prev, $cycle->doc_count);

        // Assign computed values
        $dailyRecord->live_population = $computed['live_population'];
        $dailyRecord->cum_feed_kg = $computed['cum_feed_kg'];
        $dailyRecord->cum_mortality = $computed['cum_mortality'];
        $dailyRecord->fcr_current = $computed['fcr_current'];
        $dailyRecord->mortality_rate = $computed['mortality_rate'];
        $dailyRecord->condition = $computed['condition'];
    }
}
