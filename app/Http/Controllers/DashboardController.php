<?php

namespace App\Http\Controllers;

use App\Models\Cycle;
use App\Models\DailyRecord;
use App\Models\TimelineTask;
use App\Models\WeatherCache;
use App\Models\CommodityPrice;
use App\Models\Notification;
use App\Services\WithdrawalService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    protected $withdrawalService;

    public function __construct(WithdrawalService $withdrawalService)
    {
        $this->withdrawalService = $withdrawalService;
    }

    /**
     * Handle the incoming request.
     */
    public function index()
    {
        $user = Auth::user();
        $todayStr = Carbon::today()->toDateString();

        // 1. Fetch active cycles with eager loading to prevent N+1 queries
        $activeCycles = Cycle::whereHas('coop.farm', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->where('status', 'active')
          ->with([
              'coop.farm',
              'dailyRecords',
              'healthRecords',
              'timelineTasks' => function ($q) use ($todayStr) {
                  $q->whereDate('task_date', $todayStr);
              }
          ])
          ->get();

        $activeCyclesData = [];

        foreach ($activeCycles as $cycle) {
            $docDate = Carbon::parse($cycle->doc_date);
            $dayNumber = Carbon::today()->diffInDays($docDate) + 1;
            if (Carbon::today()->isBefore($docDate)) {
                $dayNumber = 1;
            }

            // Get latest daily record from eager-loaded collection
            $latestRecord = $cycle->dailyRecords
                ->sortByDesc('record_date')
                ->first();

            // Get withdrawal status passing eager-loaded health records
            $withdrawalStatus = $this->withdrawalService->getWithdrawalStatus($cycle->id, $cycle->healthRecords);

            // Get today's tasks from eager-loaded collection
            $todayTasks = $cycle->timelineTasks;

            // Fetch last 7 records with non-null fcr_current for chart data from eager-loaded collection
            $fcrHistory = $cycle->dailyRecords
                ->whereNotNull('fcr_current')
                ->sortByDesc('record_date')
                ->take(7)
                ->reverse()
                ->values();

            // Calculate IP Score
            $ipScore = null;
            if ($latestRecord) {
                $fcr = (float) $latestRecord->fcr_current;
                $mr = (float) $latestRecord->mortality_rate;
                $avgWeight = (float) $latestRecord->avg_weight_g;
                $survival = 100 - $mr;
                $weightKg = $avgWeight / 1000;

                if ($fcr > 0 && $dayNumber > 0 && $weightKg > 0) {
                    $ipScore = ($survival * $weightKg) / ($fcr * $dayNumber) * 100;
                }
            }

            $activeCyclesData[] = [
                'id' => $cycle->id,
                'coop' => [
                    'coop_code' => $cycle->coop->coop_code,
                    'coop_type' => $cycle->coop->coop_type,
                ],
                'day_number' => $dayNumber,
                'target_days' => $cycle->target_days,
                'doc_count' => $cycle->doc_count,
                'latest_record' => $latestRecord ? [
                    'fcr_current' => $latestRecord->fcr_current,
                    'mortality_rate' => $latestRecord->mortality_rate,
                    'live_population' => $latestRecord->live_population,
                    'condition' => $latestRecord->condition,
                    'avg_weight_g' => $latestRecord->avg_weight_g,
                ] : null,
                'ip_score' => $ipScore ? round($ipScore, 1) : null,
                'withdrawal_status' => $withdrawalStatus,
                'today_tasks' => $todayTasks,
                'fcr_history' => $fcrHistory,
            ];
        }

        // 2. Fetch latest weather cache for the user's farms
        $farmIds = $user->farms()->pluck('id');
        $weather = WeatherCache::whereIn('farm_id', $farmIds)
            ->orderBy('fetched_at', 'desc')
            ->first();

        // 3. Fetch latest commodity prices for CORN, SOYBEAN, and RICEBRAN
        $commodity = CommodityPrice::orderBy('recorded_date', 'desc')
            ->get()
            ->unique('commodity')
            ->values();

        // 4. Fetch unread notifications count
        $unreadNotifications = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return Inertia::render('Dashboard', [
            'activeCycles' => $activeCyclesData,
            'weather' => $weather,
            'commodity' => $commodity,
            'unread_notifications' => $unreadNotifications,
        ]);
    }
}
