<?php

namespace App\Services;

use App\Models\Cycle;
use Carbon\Carbon;

class GoldenTimelineService
{
    /**
     * Get golden timeline template for a given species.
     */
    public static function getTemplateForSpecies(string $species): array
    {
        return match ($species) {
            'broiler' => self::broilerTemplate(),
            'bebek'   => self::bebekTemplate(),
            'lele'    => self::leleTemplate(),
            'nila'    => self::nilaTemplate(),
            default   => self::broilerTemplate(),
        };
    }

    /**
     * Get default target days range for a species.
     */
    public static function getTargetDaysRange(string $species): array
    {
        return match ($species) {
            'broiler' => ['min' => 28, 'max' => 45, 'default' => 35],
            'bebek'   => ['min' => 45, 'max' => 90, 'default' => 60],
            'lele'    => ['min' => 60, 'max' => 120, 'default' => 90],
            'nila'    => ['min' => 120, 'max' => 180, 'default' => 150],
            default   => ['min' => 28, 'max' => 45, 'default' => 35],
        };
    }

    /**
     * Seed golden timeline tasks for a newly created cycle.
     */
    public static function seedForCycle(Cycle $cycle): void
    {
        $farm = $cycle->coop->farm;
        $species = $farm->species ?? 'broiler';
        $template = self::getTemplateForSpecies($species);
        $docDate = Carbon::parse($cycle->doc_date);

        $tasks = [];
        $now = now();

        foreach ($template as $item) {
            $taskDate = $docDate->copy()->addDays($item['day'] - 1);
            $tasks[] = [
                'cycle_id'   => $cycle->id,
                'task_date'  => $taskDate->toDateString(),
                'day_number' => $item['day'],
                'task_name'  => $item['name'],
                'category'   => $item['category'],
                'is_system'  => true,
                'is_done'    => false,
                'notify'     => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        \App\Models\TimelineTask::insert($tasks);
    }

    // ── Templates ──────────────────────────────────────────────

    private static function broilerTemplate(): array
    {
        return [
            ['day' => 1,  'category' => 'management',  'name' => 'Penerimaan DOC — cek suhu brooding & air gula'],
            ['day' => 1,  'category' => 'feeding',      'name' => 'Pemberian pakan pre-starter (fine crumble)'],
            ['day' => 3,  'category' => 'vaccination',  'name' => 'Vaksinasi ND I (tetes mata)'],
            ['day' => 7,  'category' => 'sampling',     'name' => 'Sampling berat badan minggu 1'],
            ['day' => 7,  'category' => 'feeding',      'name' => 'Ganti pakan ke fase Grower (crumble)'],
            ['day' => 10, 'category' => 'management',   'name' => 'Pengecekan ketinggian sekam (litter)'],
            ['day' => 14, 'category' => 'vaccination',  'name' => 'Vaksinasi Gumboro (IBD) via air minum'],
            ['day' => 14, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 2'],
            ['day' => 21, 'category' => 'vaccination',  'name' => 'Vaksinasi ND Booster (air minum)'],
            ['day' => 21, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 3'],
            ['day' => 22, 'category' => 'feeding',      'name' => 'Ganti pakan ke fase Finisher (pellet)'],
            ['day' => 28, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 4'],
            ['day' => 30, 'category' => 'management',   'name' => 'Persiapan pra-panen — kurangi pakan 2-3%'],
            ['day' => 35, 'category' => 'management',   'name' => 'Target panen — evaluasi FCR & berat akhir'],
        ];
    }

    private static function bebekTemplate(): array
    {
        return [
            ['day' => 1,  'category' => 'management',  'name' => 'Penerimaan DOD — istirahat 30 menit & larutan gula merah'],
            ['day' => 1,  'category' => 'feeding',      'name' => 'Pemberian pakan starter (campuran air) 5x/hari'],
            ['day' => 1,  'category' => 'vaccination',  'name' => 'Vaksinasi ND I (tetes mata/hidung)'],
            ['day' => 7,  'category' => 'vaccination',  'name' => 'Vaksinasi AI (Avian Influenza) dosis 1'],
            ['day' => 7,  'category' => 'sampling',     'name' => 'Sampling berat badan minggu 1'],
            ['day' => 10, 'category' => 'vaccination',  'name' => 'Vaksinasi Kolera / Salmonella (injeksi)'],
            ['day' => 14, 'category' => 'vaccination',  'name' => 'Vaksinasi ND Booster'],
            ['day' => 14, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 2'],
            ['day' => 15, 'category' => 'management',   'name' => 'Pindah ke kandang postal (dari box)'],
            ['day' => 21, 'category' => 'feeding',      'name' => 'Ganti pakan ke fase Grower, 3x/hari'],
            ['day' => 21, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 3'],
            ['day' => 28, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 4'],
            ['day' => 35, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 5'],
            ['day' => 42, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 6'],
            ['day' => 49, 'category' => 'vaccination',  'name' => 'Vaksinasi AI dosis 2'],
            ['day' => 55, 'category' => 'management',   'name' => 'Persiapan pra-panen — kurangi pakan'],
            ['day' => 60, 'category' => 'management',   'name' => 'Target panen — evaluasi bobot akhir'],
        ];
    }

    private static function leleTemplate(): array
    {
        return [
            ['day' => 1,  'category' => 'management',  'name' => 'Tebar benih — aklimatisasi suhu kolam'],
            ['day' => 1,  'category' => 'feeding',      'name' => 'Pemberian pakan starter 5% biomassa, 4-5x/hari'],
            ['day' => 7,  'category' => 'sampling',     'name' => 'Sampling berat badan minggu 1'],
            ['day' => 7,  'category' => 'management',   'name' => 'Cek kualitas air (pH, amonia, suhu)'],
            ['day' => 14, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 2'],
            ['day' => 14, 'category' => 'management',   'name' => 'Grading/sortir ukuran — cegah kanibalisme'],
            ['day' => 21, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 3'],
            ['day' => 21, 'category' => 'management',   'name' => 'Penggantian air 30-50%'],
            ['day' => 28, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 4'],
            ['day' => 30, 'category' => 'feeding',      'name' => 'Evaluasi feeding rate — sesuaikan 3-4% biomassa'],
            ['day' => 35, 'category' => 'management',   'name' => 'Cek kualitas air & bersih dasar kolam'],
            ['day' => 42, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 6'],
            ['day' => 49, 'category' => 'management',   'name' => 'Grading/sortir ukuran kedua'],
            ['day' => 56, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 8'],
            ['day' => 60, 'category' => 'feeding',      'name' => 'Kurangi frekuensi pakan ke 3x/hari'],
            ['day' => 70, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 10'],
            ['day' => 75, 'category' => 'management',   'name' => 'Persiapan pra-panen — kurangi pakan 2-3%'],
            ['day' => 80, 'category' => 'management',   'name' => 'Puasakan ikan 24 jam sebelum panen parsial'],
            ['day' => 90, 'category' => 'management',   'name' => 'Target panen — evaluasi bobot akhir (8-12 ekor/kg)'],
        ];
    }

    private static function nilaTemplate(): array
    {
        return [
            ['day' => 1,   'category' => 'management',  'name' => 'Tebar benih — aklimatisasi suhu kolam'],
            ['day' => 1,   'category' => 'feeding',      'name' => 'Pemberian pakan starter 5% biomassa, 3x/hari'],
            ['day' => 7,   'category' => 'sampling',     'name' => 'Sampling berat badan minggu 1'],
            ['day' => 7,   'category' => 'management',   'name' => 'Cek kualitas air (pH, oksigen, suhu)'],
            ['day' => 14,  'category' => 'sampling',     'name' => 'Sampling berat badan minggu 2'],
            ['day' => 21,  'category' => 'sampling',     'name' => 'Sampling berat badan minggu 3'],
            ['day' => 21,  'category' => 'management',   'name' => 'Penggantian air bertahap'],
            ['day' => 28,  'category' => 'sampling',     'name' => 'Sampling berat badan minggu 4'],
            ['day' => 30,  'category' => 'feeding',      'name' => 'Evaluasi feeding rate — sesuaikan 3-4% biomassa'],
            ['day' => 42,  'category' => 'sampling',     'name' => 'Sampling berat badan minggu 6'],
            ['day' => 56,  'category' => 'sampling',     'name' => 'Sampling berat badan minggu 8'],
            ['day' => 60,  'category' => 'management',   'name' => 'Cek kualitas air & bersih kolam'],
            ['day' => 70,  'category' => 'sampling',     'name' => 'Sampling berat badan minggu 10'],
            ['day' => 84,  'category' => 'sampling',     'name' => 'Sampling berat badan minggu 12'],
            ['day' => 90,  'category' => 'management',   'name' => 'Penggantian air bertahap'],
            ['day' => 98,  'category' => 'sampling',     'name' => 'Sampling berat badan minggu 14'],
            ['day' => 112, 'category' => 'sampling',     'name' => 'Sampling berat badan minggu 16'],
            ['day' => 120, 'category' => 'management',   'name' => 'Cek kualitas air & persiapan pra-panen'],
            ['day' => 135, 'category' => 'management',   'name' => 'Kurangi pakan ke 2-3% biomassa'],
            ['day' => 150, 'category' => 'management',   'name' => 'Target panen — evaluasi bobot akhir (300-500g)'],
        ];
    }
}
