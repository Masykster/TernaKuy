<?php

namespace App\Http\Controllers;

use App\Models\TimelineTask;
use App\Models\Cycle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Carbon\Carbon;

class TimelineTaskController extends Controller
{
    use AuthorizesRequests;

    /**
     * Store a newly created custom timeline task.
     */
    public function store(Request $request, $cycleId)
    {
        $cycle = Cycle::findOrFail($cycleId);
        $this->authorize('update', $cycle->coop->farm);

        $validated = $request->validate([
            'task_name' => 'required|string|max:200',
            'task_date' => 'required|date',
            'category' => 'required|in:vaccination,sampling,feeding,management,custom',
            'notify' => 'boolean',
        ]);

        $docDate = Carbon::parse($cycle->doc_date);
        $taskDate = Carbon::parse($validated['task_date']);
        $dayNumber = $taskDate->diffInDays($docDate) + 1;
        if ($taskDate->isBefore($docDate)) {
            $dayNumber = 1;
        }

        $cycle->timelineTasks()->create([
            'task_name' => $validated['task_name'],
            'task_date' => $validated['task_date'],
            'category' => $validated['category'],
            'day_number' => $dayNumber,
            'is_system' => false,
            'is_done' => false,
            'notify' => $request->has('notify') ? filter_var($request->input('notify'), FILTER_VALIDATE_BOOLEAN) : true,
        ]);

        return redirect()->back()->with('success', 'Tugas kustom berhasil ditambahkan!');
    }

    /**
     * Toggle the status of a timeline task.
     */
    public function toggle(Request $request, $cycleId, $taskId)
    {
        $cycle = Cycle::findOrFail($cycleId);
        $this->authorize('update', $cycle->coop->farm);

        $task = TimelineTask::where('cycle_id', $cycle->id)->findOrFail($taskId);

        $isDone = $request->input('is_done');
        if ($isDone === null) {
            $isDone = !$task->is_done;
        } else {
            $isDone = filter_var($isDone, FILTER_VALIDATE_BOOLEAN);
        }

        $task->update([
            'is_done' => $isDone,
            'done_at' => $isDone ? now() : null,
        ]);

        return redirect()->back();
    }

    /**
     * Update a timeline task.
     */
    public function update(Request $request, $cycleId, $taskId)
    {
        $cycle = Cycle::findOrFail($cycleId);
        $this->authorize('update', $cycle->coop->farm);

        $task = TimelineTask::where('cycle_id', $cycle->id)->findOrFail($taskId);

        $validated = $request->validate([
            'task_name' => 'required|string|max:200',
            'task_date' => 'required|date',
            'category' => 'required|in:vaccination,sampling,feeding,management,custom',
            'notes' => 'nullable|string',
        ]);

        $docDate = Carbon::parse($cycle->doc_date);
        $taskDate = Carbon::parse($validated['task_date']);
        $dayNumber = $taskDate->diffInDays($docDate) + 1;
        if ($taskDate->isBefore($docDate)) {
            $dayNumber = 1;
        }

        $task->update([
            'task_name' => $validated['task_name'],
            'task_date' => $validated['task_date'],
            'category' => $validated['category'],
            'day_number' => $dayNumber,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Tugas berhasil diperbarui!');
    }

    /**
     * Delete a timeline task.
     */
    public function destroy($cycleId, $taskId)
    {
        $cycle = Cycle::findOrFail($cycleId);
        $this->authorize('update', $cycle->coop->farm);

        $task = TimelineTask::where('cycle_id', $cycle->id)->findOrFail($taskId);
        $task->delete();

        return redirect()->back()->with('success', 'Tugas berhasil dihapus!');
    }
}
