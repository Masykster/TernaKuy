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

        if ($activeCycles->isEmpty()) {
            $coopsWithoutActiveCycle = \App\Models\Coop::whereHas('farm', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->whereDoesntHave('cycles', function ($q) {
                $q->where('status', 'active');
            })->get();

            if ($coopsWithoutActiveCycle->isNotEmpty()) {
                foreach ($coopsWithoutActiveCycle as $coop) {
                    $activeCycle = Cycle::create([
                        'coop_id' => $coop->id,
                        'doc_date' => Carbon::today()->toDateString(),
                        'doc_count' => $coop->capacity,
                        'strain' => 'Cobb',
                        'supplier_doc' => 'Kemitraan',
                        'price_doc' => 7000,
                        'target_days' => 35,
                        'status' => 'active',
                    ]);
                    \App\Services\GoldenTimelineService::seedForCycle($activeCycle);
                }

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
            }
        }

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

        // 2. Fetch weather forecast for active farm (or user's first active farm)
        $activeFarm = null;
        if (count($activeCycles) > 0) {
            $activeFarm = $activeCycles[0]->coop->farm;
        } else {
            $activeFarm = $user->farms()->where('is_active', true)->first() ?? $user->farms()->first();
        }

        $weatherForecast = [];
        if ($activeFarm) {
            $weatherForecast = app(\App\Services\WeatherService::class)->getForecast($activeFarm);
        } else {
            $weatherForecast = app(\App\Services\WeatherService::class)->getFallbackForecast();
        }

        $farmIds = $user->farms()->pluck('id');
        $weather = WeatherCache::whereIn('farm_id', $farmIds)
            ->orderBy('fetched_at', 'desc')
            ->first();

        // 3. Fetch latest commodity prices — only 1 row per commodity via DB subquery
        $commodity = CommodityPrice::whereIn('id', function ($query) {
            $query->selectRaw('MAX(id)')
                ->from('commodity_prices')
                ->groupBy('commodity');
        })->orderBy('recorded_date', 'desc')->get();

        // 4. Fetch unread notifications count
        $unreadNotifications = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        // 5. Fetch recent notifications
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(15)
            ->get();

        return Inertia::render('Dashboard', [
            'activeCycles' => $activeCyclesData,
            'weather' => $weather,
            'weather_forecast' => $weatherForecast,
            'commodity' => $commodity,
            'unread_notifications' => $unreadNotifications,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markNotificationAsRead($id)
    {
        $notification = Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->update(['is_read' => true]);
        return redirect()->back();
    }
}
