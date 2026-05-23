<?php

namespace App\Http\Controllers;

use App\Models\Coop;
use App\Models\Cycle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CycleController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $cycles = Cycle::whereHas('coop.farm', function ($q) {
            $q->where('user_id', Auth::id());
        })->with('coop.farm')->get();

        return Inertia::render('Cycle/Index', [
            'cycles' => $cycles
        ]);
    }

    public function create()
    {
        $coops = Coop::whereHas('farm', function ($q) {
            $q->where('user_id', Auth::id());
        })->get();

        return Inertia::render('Cycle/Create', [
            'coops' => $coops
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'coop_id' => 'required|exists:coops,id',
            'doc_date' => 'required|date',
            'doc_count' => 'required|integer|min:1',
            'strain' => 'required|in:Ross,Cobb,Lohmann,Other',
            'supplier_doc' => 'nullable|string|max:255',
            'price_doc' => 'nullable|numeric|min:0',
            'target_days' => 'required|integer|between:28,45',
            'notes' => 'nullable|string',
        ]);

        $coop = Coop::findOrFail($validated['coop_id']);
        $this->authorize('update', $coop->farm);

        Cycle::create($validated);

        return redirect()->route('dashboard');
    }

    public function show(Cycle $cycle)
    {
        $this->authorize('view', $cycle);
        $cycle->load(['coop.farm', 'timelineTasks' => function ($q) {
            $q->orderBy('day_number', 'asc');
        }]);

        return Inertia::render('Cycle/Show', [
            'cycle' => $cycle
        ]);
    }

    public function update(Request $request, Cycle $cycle)
    {
        $this->authorize('update', $cycle);

        $validated = $request->validate([
            'status' => 'nullable|in:active,harvested,closed_forced',
            'notes' => 'nullable|string',
            'closed_at' => 'nullable|date',
        ]);

        $cycle->update($validated);

        return redirect()->back();
    }

    public function harvest(Cycle $cycle)
    {
        $this->authorize('update', $cycle->coop->farm);

        $cycle->update([
            'status' => 'harvested',
            'closed_at' => now(),
        ]);

        return redirect()->route('dashboard')->with('success', 'Siklus berhasil dipanen!');
    }

    public function withdrawal($cycleId)
    {
        $cycle = Cycle::with('coop.farm')->findOrFail($cycleId);
        $this->authorize('view', $cycle->coop->farm);

        $status = app(\App\Services\WithdrawalService::class)->getWithdrawalStatus($cycle->id);

        return Inertia::render('Cycle/Withdrawal', [
            'cycle' => $cycle,
            'withdrawalStatus' => $status,
        ]);
    }
}
