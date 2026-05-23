<?php

namespace App\Http\Controllers;

use App\Models\Cycle;
use App\Models\DailyRecord;
use App\Models\CommodityPrice;
use App\Services\CommodityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class CommodityController extends Controller
{
    protected $commodityService;

    public function __construct(CommodityService $commodityService)
    {
        $this->commodityService = $commodityService;
    }

    /**
     * Display the commodity feed prices page.
     */
    public function index()
    {
        $user = Auth::user();

        // 1. Get latest prices for each commodity
        $latestPrices = CommodityPrice::orderBy('recorded_date', 'desc')
            ->get()
            ->unique('commodity')
            ->values();

        // 2. Estimate remaining feed for the active cycle, if any
        $activeCycle = Cycle::whereHas('coop.farm', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->where('status', 'active')->first();

        $remainingFeedKg = 1000.0; // Default fallback
        if ($activeCycle) {
            $latestRecord = DailyRecord::where('cycle_id', $activeCycle->id)
                ->orderBy('record_date', 'desc')
                ->first();
            
            $consumed = $latestRecord ? (float) $latestRecord->cum_feed_kg : 0.0;
            // standard broiler eats approx 3.5kg of feed total
            $totalEstimatedNeeded = $activeCycle->doc_count * 3.5;
            $remainingFeedKg = max(100.0, $totalEstimatedNeeded - $consumed);
        }

        // 3. Get bulk buy recommendations from the service
        $recommendations = $this->commodityService->getBulkBuyRecommendations($remainingFeedKg);

        // 4. Fetch 30-day historical prices for the charts
        $thirtyDaysAgo = Carbon::today()->subDays(30)->toDateString();
        $history = CommodityPrice::where('recorded_date', '>=', $thirtyDaysAgo)
            ->orderBy('recorded_date', 'asc')
            ->get()
            ->groupBy('commodity');

        return Inertia::render('Commodity/Index', [
            'latestPrices' => $latestPrices,
            'recommendations' => $recommendations,
            'history' => $history,
            'remainingFeedKg' => round($remainingFeedKg, 1),
            'lastUpdated' => $latestPrices->first() ? $latestPrices->first()->updated_at->timezone('Asia/Jakarta')->format('d M Y H:i') : null,
        ]);
    }
}
