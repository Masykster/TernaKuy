<?php

namespace App\Http\Controllers;

use App\Models\Cycle;
use App\Models\DailyRecord;
use App\Models\HarvestRecord;
use App\Services\CalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class HarvestRecordController extends Controller
{
    use AuthorizesRequests;

    protected $calculationService;

    public function __construct(CalculationService $calculationService)
    {
        $this->calculationService = $calculationService;
    }

    /**
     * Store a new harvest record and close the cycle.
     */
    public function store(Request $request, $cycleId)
    {
        $cycle = Cycle::findOrFail($cycleId);
        $this->authorize('update', $cycle->coop->farm);

        $validated = $request->validate([
            'harvest_date' => 'required|date',
            'harvest_count' => 'required|integer|min:1',
            'total_weight_kg' => 'required|numeric|min:0.1',
            'price_per_kg' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // Get summaries of feed and mortality from daily_records
        $sumFeed = (float) DailyRecord::where('cycle_id', $cycle->id)->sum('feed_kg');
        $sumMortality = (int) DailyRecord::where('cycle_id', $cycle->id)->sum('mortality');

        // Execute final calculations
        $results = $this->calculationService->calculateHarvest(
            [
                'doc_date' => $cycle->doc_date,
                'doc_count' => $cycle->doc_count,
            ],
            $validated,
            [
                'sum_feed_kg' => $sumFeed,
                'sum_mortality' => $sumMortality,
            ]
        );

        // Save harvest record
        HarvestRecord::create([
            'cycle_id' => $cycle->id,
            'harvest_date' => $validated['harvest_date'],
            'harvest_count' => $validated['harvest_count'],
            'total_weight_kg' => $validated['total_weight_kg'],
            'avg_weight_kg' => $results['avg_weight_kg'],
            'price_per_kg' => $validated['price_per_kg'] ?? null,
            'total_revenue' => $results['total_revenue'],
            'fcr_final' => $results['fcr_final'],
            'ip_score' => $results['ip_score'],
            'mortality_rate' => $results['mortality_rate'],
            'notes' => $validated['notes'] ?? null,
        ]);

        // Update cycle status
        $cycle->update([
            'status' => 'harvested',
            'closed_at' => now(),
        ]);

        return redirect()->route('cycles.report', ['cycle' => $cycle->id])
            ->with('success', 'Siklus berhasil dipanen dan diselesaikan!');
    }
}
