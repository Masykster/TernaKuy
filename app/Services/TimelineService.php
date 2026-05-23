<?php

namespace App\Services;

use App\Models\Cycle;
use App\Models\TimelineTask;
use Carbon\Carbon;

class TimelineService
{
    /**
     * Generate standard broiler timeline tasks for a cycle.
     */
    public function generateBroilerTimeline(Cycle $cycle): void
    {
        $tasks = [
            ['day_number' => 1, 'task_name' => "DOC masuk · Cek kondisi DOC · Set suhu brooder 33°C", 'category' => 'management'],
            ['day_number' => 2, 'task_name' => "Pantau konsumsi air · Cek nafsu makan", 'category' => 'management'],
            ['day_number' => 3, 'task_name' => "Observasi perilaku · Catat mortalitas awal", 'category' => 'management'],
            ['day_number' => 4, 'task_name' => "Vaksinasi Newcastle Disease (ND) — tetes mata", 'category' => 'vaccination'],
            ['day_number' => 7, 'task_name' => "Sampling berat pertama · Evaluasi minggu ke-1", 'category' => 'sampling'],
            ['day_number' => 10, 'task_name' => "Vaksinasi Gumboro (IBD) — air minum", 'category' => 'vaccination'],
            ['day_number' => 14, 'task_name' => "Evaluasi FCR minggu ke-2 · Kurangi suhu ke 29°C", 'category' => 'management'],
            ['day_number' => 18, 'task_name' => "Vaksinasi ND booster", 'category' => 'vaccination'],
            ['day_number' => 21, 'task_name' => "Sampling berat · Kalkulasi FCR running", 'category' => 'sampling'],
            ['day_number' => 24, 'task_name' => "Evaluasi kondisi kandang · Densitas populasi", 'category' => 'management'],
            ['day_number' => 28, 'task_name' => "Sampling berat · Evaluasi target panen", 'category' => 'sampling'],
            ['day_number' => 29, 'task_name' => "Ganti pakan ke finisher", 'category' => 'feeding'],
            ['day_number' => 32, 'task_name' => "Sampling berat · Estimasi berat panen", 'category' => 'sampling'],
            ['day_number' => 35, 'task_name' => "Target panen · Cek withdrawal period semua obat", 'category' => 'management'],
        ];

        $docDate = Carbon::parse($cycle->doc_date);
        $data = [];

        foreach ($tasks as $task) {
            $data[] = [
                'cycle_id' => $cycle->id,
                'task_date' => $docDate->copy()->addDays($task['day_number'] - 1)->toDateString(),
                'day_number' => $task['day_number'],
                'task_name' => $task['task_name'],
                'category' => $task['category'],
                'is_system' => true,
                'is_done' => false,
                'done_at' => null,
                'notify' => true,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        TimelineTask::insert($data);
    }
}
