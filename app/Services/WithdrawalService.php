<?php

namespace App\Services;

use App\Models\HealthRecord;
use Carbon\Carbon;

class WithdrawalService
{
    /**
     * Compute the end date of a withdrawal period.
     */
    public function computeEndDate(string $recordDate, int $withdrawalDays): string
    {
        return Carbon::parse($recordDate)->addDays($withdrawalDays)->toDateString();
    }

    /**
     * Retrieve the withdrawal status for a specific cycle.
     */
    public function getWithdrawalStatus(int $cycleId, $healthRecords = null): array
    {
        if ($healthRecords !== null) {
            $records = $healthRecords->where('record_type', 'treatment');
        } else {
            $records = HealthRecord::where('cycle_id', $cycleId)
                ->where('record_type', 'treatment')
                ->get();
        }

        $today = Carbon::today()->startOfDay();
        $hasActive = false;
        $safeHarvestDate = null;
        $activeWithdrawals = [];
        $allWithdrawals = [];

        foreach ($records as $record) {
            $end = Carbon::parse($record->withdrawal_end)->startOfDay();
            $daysLeft = $today->diffInDays($end, false);
            $daysLeft = $daysLeft < 0 ? 0 : (int) $daysLeft;

            $wDays = (int) $record->withdrawal_days;
            $elapsed = $wDays - $daysLeft;
            $progressPct = $wDays > 0 ? max(0, min(100, ($elapsed / $wDays) * 100)) : 100;

            $item = [
                'drug_name' => $record->drug_name,
                'given_date' => $record->record_date->toDateString(),
                'end_date' => $record->withdrawal_end->toDateString(),
                'days_left' => $daysLeft,
                'progress_pct' => (int) round($progressPct),
            ];

            $allWithdrawals[] = $item;

            if ($daysLeft > 0) {
                $hasActive = true;
                $activeWithdrawals[] = $item;

                if ($safeHarvestDate === null || $end->isAfter(Carbon::parse($safeHarvestDate))) {
                    $safeHarvestDate = $record->withdrawal_end->toDateString();
                }
            }
        }

        return [
            'has_active' => $hasActive,
            'safe_harvest_date' => $safeHarvestDate,
            'is_safe_to_harvest' => !$hasActive,
            'active_withdrawals' => $activeWithdrawals,
            'all_withdrawals' => $allWithdrawals,
        ];
    }
}
