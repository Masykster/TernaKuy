<?php

namespace App\Http\Controllers;

use App\Models\Cycle;
use App\Models\DailyRecord;
use App\Services\WithdrawalService;
use App\Services\PdfReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ReportController extends Controller
{
    use AuthorizesRequests;

    protected $withdrawalService;
    protected $pdfReportService;

    public function __construct(WithdrawalService $withdrawalService, PdfReportService $pdfReportService)
    {
        $this->withdrawalService = $withdrawalService;
        $this->pdfReportService = $pdfReportService;
    }

    /**
     * Display the Inertia report page for a cycle.
     */
    public function show($cycleId)
    {
        $cycle = Cycle::with(['coop.farm.user', 'dailyRecords' => function ($q) {
            $q->orderBy('record_date', 'asc');
        }, 'healthRecords' => function ($q) {
            $q->orderBy('record_date', 'asc');
        }, 'harvestRecord'])->findOrFail($cycleId);

        $this->authorize('view', $cycle);

        $withdrawalStatus = $this->withdrawalService->getWithdrawalStatus($cycle->id);

        // Fetch sum totals for presentation
        $totalFeedKg = (float) $cycle->dailyRecords->sum('feed_kg');
        $totalMortality = (int) $cycle->dailyRecords->sum('mortality');

        return Inertia::render('Cycle/Report', [
            'cycle' => $cycle,
            'withdrawalStatus' => $withdrawalStatus,
            'summary' => [
                'total_feed_kg' => $totalFeedKg,
                'total_mortality' => $totalMortality,
            ]
        ]);
    }

    /**
     * Download the PDF report for the cycle.
     */
    public function download($cycleId)
    {
        $cycle = Cycle::with(['coop.farm.user', 'dailyRecords' => function ($q) {
            $q->orderBy('record_date', 'asc');
        }, 'healthRecords' => function ($q) {
            $q->orderBy('record_date', 'asc');
        }, 'harvestRecord'])->findOrFail($cycleId);

        $this->authorize('view', $cycle);

        return $this->pdfReportService->generate($cycle);
    }
}
