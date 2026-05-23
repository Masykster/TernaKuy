<?php

namespace App\Http\Controllers;

use App\Http\Requests\DailyRecordRequest;
use App\Models\Cycle;
use App\Models\DailyRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class DailyRecordController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the daily records for a cycle.
     */
    public function index($cycleId)
    {
        $cycle = Cycle::findOrFail($cycleId);
        $this->authorize('view', $cycle);

        $records = DailyRecord::where('cycle_id', $cycle->id)
            ->orderBy('record_date', 'asc')
            ->get();

        return response()->json($records);
    }

    /**
     * Show the form for creating a new daily record.
     */
    public function create(Cycle $cycle)
    {
        $this->authorize('update', $cycle->coop->farm);

        $prevRecord = DailyRecord::where('cycle_id', $cycle->id)
            ->orderBy('record_date', 'desc')
            ->first();

        $docDate = \Carbon\Carbon::parse($cycle->doc_date);
        $dayNumber = now()->startOfDay()->diffInDays($docDate->startOfDay()) + 1;
        if (now()->isBefore($docDate)) {
            $dayNumber = 1;
        }

        return Inertia::render('Cycle/Daily', [
            'cycle' => $cycle->load('coop.farm'),
            'prevRecord' => $prevRecord,
            'dayNumber' => $dayNumber,
            'todayDate' => now()->toDateString(),
        ]);
    }

    /**
     * Store a newly created daily record in storage.
     */
    public function store(DailyRecordRequest $request, Cycle $cycle)
    {
        $this->authorize('update', $cycle->coop->farm);

        $recordDate = $request->input('record_date') ?: now()->toDateString();

        // Check for duplicate record
        $exists = DailyRecord::where('cycle_id', $cycle->id)
            ->whereDate('record_date', $recordDate)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'record_date' => 'Data untuk hari ini sudah ada'
            ]);
        }

        $record = new DailyRecord($request->validated());
        $record->cycle_id = $cycle->id;
        $record->record_date = $recordDate;
        $record->save();

        return redirect()->route('dashboard')->with('daily_record_saved', [
            'id' => $record->id,
            'fcr_current' => $record->fcr_current,
            'mortality' => $record->mortality,
            'live_population' => $record->live_population,
            'initial_doc' => $cycle->doc_count,
            'feed_kg' => $record->feed_kg,
        ]);
    }

    /**
     * Display the specified daily record.
     */
    public function show($cycleId, $date)
    {
        $cycle = Cycle::findOrFail($cycleId);
        $this->authorize('view', $cycle);

        $record = DailyRecord::where('cycle_id', $cycle->id)
            ->where('record_date', $date)
            ->firstOrFail();

        return response()->json($record);
    }

    /**
     * Update the specified daily record in storage.
     */
    public function update(DailyRecordRequest $request, $cycleId, $date)
    {
        $cycle = Cycle::findOrFail($cycleId);
        $this->authorize('update', $cycle->coop->farm);

        $record = DailyRecord::where('cycle_id', $cycle->id)
            ->where('record_date', $date)
            ->firstOrFail();

        // Prevent update after 24 hours of creation
        if ($record->created_at->addHours(24)->isPast()) {
            return response()->json(['message' => 'Record cannot be updated after 24 hours.'], 403);
        }

        $record->update($request->validated());

        return response()->json([
            'message' => 'Record updated successfully',
            'record' => $record
        ]);
    }
}
