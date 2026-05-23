<?php

namespace App\Http\Controllers;

use App\Http\Requests\HealthRecordRequest;
use App\Models\Cycle;
use App\Models\HealthRecord;
use App\Models\DrugReference;
use App\Services\WithdrawalService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class HealthRecordController extends Controller
{
    use AuthorizesRequests;

    protected $withdrawalService;

    public function __construct(WithdrawalService $withdrawalService)
    {
        $this->withdrawalService = $withdrawalService;
    }

    /**
     * Display a listing of the health records along with drug reference list and withdrawal warning.
     */
    public function index($cycleId)
    {
        $cycle = Cycle::with('coop.farm')->findOrFail($cycleId);
        $this->authorize('view', $cycle->coop->farm);

        $records = HealthRecord::where('cycle_id', $cycle->id)
            ->orderBy('record_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $withdrawalStatus = $this->withdrawalService->getWithdrawalStatus($cycle->id);
        $drugsReference = DrugReference::where('is_active', true)->get();

        return Inertia::render('Cycle/Health', [
            'cycle' => $cycle,
            'records' => $records,
            'withdrawalStatus' => $withdrawalStatus,
            'drugsReference' => $drugsReference,
        ]);
    }

    /**
     * Store a newly created health record in storage.
     */
    public function store(HealthRecordRequest $request, $cycleId)
    {
        $cycle = Cycle::findOrFail($cycleId);
        $this->authorize('update', $cycle->coop->farm);

        $record = new HealthRecord($request->validated());
        $record->cycle_id = $cycle->id;
        $record->save();

        return redirect()->back()->with('success', 'Catatan kesehatan berhasil disimpan!');
    }

    /**
     * Remove the specified health record from storage.
     */
    public function destroy($cycleId, $id)
    {
        $cycle = Cycle::findOrFail($cycleId);
        $this->authorize('update', $cycle->coop->farm);

        if ($cycle->status !== 'active') {
            return redirect()->back()->withErrors([
                'message' => 'Catatan kesehatan tidak dapat dihapus karena siklus sudah selesai.'
            ]);
        }

        $record = HealthRecord::where('cycle_id', $cycle->id)->findOrFail($id);
        $record->delete();

        return redirect()->back()->with('success', 'Catatan kesehatan berhasil dihapus!');
    }
}
