<?php

namespace App\Services;

class CalculationService
{
    /**
     * Calculate daily stats for poultry record.
     */
    public function calculateDaily(array $input, array $prev, int $initialDoc): array
    {
        $feedKg = (float) ($input['feed_kg'] ?? 0);
        $mortality = (int) ($input['mortality'] ?? 0);
        $avgWeightG = !empty($input['avg_weight_g']) ? (float) $input['avg_weight_g'] : null;

        $prevLivePop = (int) ($prev['live_population'] ?? 0);
        $prevCumFeed = (float) ($prev['cum_feed_kg'] ?? 0.0);
        $prevCumMortality = (int) ($prev['cum_mortality'] ?? 0);

        // Calculate values
        $livePop = max(0, $prevLivePop - $mortality);
        $cumFeed = $prevCumFeed + $feedKg;
        $cumMortality = $prevCumMortality + $mortality;

        // Calculate mortality rate (cumulative mortality divided by initial doc size)
        $mortalityRate = $initialDoc > 0 ? ($cumMortality / $initialDoc) * 100 : 0.00;

        // Calculate FCR
        $fcrCurrent = null;
        if ($avgWeightG && $avgWeightG > 0 && $livePop > 0) {
            $fcrCurrent = $cumFeed / (($livePop * $avgWeightG) / 1000);
        }

        // Determine general status condition
        $condition = 'good';
        $fcrVal = $fcrCurrent;
        $mrVal = $mortalityRate;

        if (($fcrVal !== null && $fcrVal > 1.9) || $mrVal > 7) {
            $condition = 'critical';
        } elseif (($fcrVal !== null && $fcrVal > 1.6) || $mrVal > 3) {
            $condition = 'warning';
        }

        return [
            'live_population' => $livePop,
            'cum_feed_kg' => $cumFeed,
            'cum_mortality' => $cumMortality,
            'fcr_current' => $fcrCurrent,
            'mortality_rate' => $mortalityRate,
            'condition' => $condition,
        ];
    }

    /**
     * Calculate final stats for harvesting.
     */
    public function calculateHarvest(array $cycle, array $harvest, array $summary): array
    {
        $docDate = \Carbon\Carbon::parse($cycle['doc_date']);
        $harvestDate = \Carbon\Carbon::parse($harvest['harvest_date']);
        $harvestAgeDays = abs($harvestDate->diffInDays($docDate));
        if ($harvestAgeDays <= 0) {
            $harvestAgeDays = 1;
        }

        $totalWeightKg = (float) $harvest['total_weight_kg'];
        $harvestCount = (int) $harvest['harvest_count'];
        $pricePerKg = isset($harvest['price_per_kg']) ? (float) $harvest['price_per_kg'] : null;

        $docCount = (int) $cycle['doc_count'];
        $sumFeedKg = (float) $summary['sum_feed_kg'];
        $sumMortality = (int) $summary['sum_mortality'];

        $avgWeightKg = $harvestCount > 0 ? $totalWeightKg / $harvestCount : 0.0;
        $fcrFinal = $totalWeightKg > 0 ? $sumFeedKg / $totalWeightKg : 0.0;
        $mortalityRate = $docCount > 0 ? ($sumMortality / $docCount) * 100 : 0.0;
        $survivalRate = 100 - $mortalityRate;

        // ipScore = ((survivalRate/100) * avgWeightKg) / (fcrFinal * harvestAgeDays) * 100
        $ipScore = 0.0;
        $divider = $fcrFinal * $harvestAgeDays;
        if ($divider > 0) {
            $ipScore = (($survivalRate / 100) * $avgWeightKg) / $divider * 100;
        }

        $totalRevenue = $pricePerKg !== null ? $totalWeightKg * $pricePerKg : null;

        return [
            'harvest_age_days' => $harvestAgeDays,
            'avg_weight_kg' => $avgWeightKg,
            'fcr_final' => $fcrFinal,
            'mortality_rate' => $mortalityRate,
            'survival_rate' => $survivalRate,
            'ip_score' => $ipScore,
            'total_revenue' => $totalRevenue,
        ];
    }
}
