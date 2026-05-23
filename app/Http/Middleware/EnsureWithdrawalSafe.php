<?php

namespace App\Http\Middleware;

use App\Services\WithdrawalService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWithdrawalSafe
{
    protected $withdrawalService;

    public function __construct(WithdrawalService $withdrawalService)
    {
        $this->withdrawalService = $withdrawalService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $cycle = $request->route('cycle');
        $cycleId = $cycle instanceof \App\Models\Cycle ? $cycle->id : (int) $cycle;

        if ($cycleId) {
            $status = $this->withdrawalService->getWithdrawalStatus($cycleId);

            if ($status['has_active']) {
                $firstActive = $status['active_withdrawals'][0];
                $drugName = $firstActive['drug_name'];
                $safeDate = $status['safe_harvest_date'];
                $daysLeft = $firstActive['days_left'];

                $message = "Belum aman dipanen. {$drugName} withdrawal selesai {$safeDate} ({$daysLeft} hari lagi).";

                return response()->json([
                    'message' => $message
                ], 422);
            }
        }

        return $next($request);
    }
}
