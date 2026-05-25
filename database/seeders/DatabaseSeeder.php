<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        \App\Models\DrugReference::insert([
            ['drug_name' => 'Amoksisilin', 'category' => 'antibiotic', 'withdrawal_days' => 10, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['drug_name' => 'Enrofloksasin', 'category' => 'antibiotic', 'withdrawal_days' => 10, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['drug_name' => 'Doksisiklin', 'category' => 'antibiotic', 'withdrawal_days' => 7, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['drug_name' => 'Oksitetrasiklin', 'category' => 'antibiotic', 'withdrawal_days' => 10, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['drug_name' => 'Tilosin', 'category' => 'antibiotic', 'withdrawal_days' => 5, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['drug_name' => 'Kolistin', 'category' => 'antibiotic', 'withdrawal_days' => 7, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['drug_name' => 'Neomycin', 'category' => 'antibiotic', 'withdrawal_days' => 5, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['drug_name' => 'Vaksin ND (Newcastle)', 'category' => 'vaccine', 'withdrawal_days' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['drug_name' => 'Vaksin IBD (Gumboro)', 'category' => 'vaccine', 'withdrawal_days' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['drug_name' => 'Vaksin IB (Bronchitis)', 'category' => 'vaccine', 'withdrawal_days' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['drug_name' => 'Vitamin C', 'category' => 'vitamin', 'withdrawal_days' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['drug_name' => 'Vitamin AD3E', 'category' => 'vitamin', 'withdrawal_days' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $farm = \App\Models\Farm::create([
            'user_id' => $user->id,
            'name' => 'Pibo Farm Kediri',
            'address' => 'Jl. Raya Papar No. 45, Kediri, Jawa Timur',
            'latitude' => -7.7124,
            'longitude' => 112.0734,
            'species' => 'broiler',
            'is_active' => true,
        ]);

        $coop = \App\Models\Coop::create([
            'farm_id' => $farm->id,
            'coop_code' => 'Kandang A1',
            'coop_type' => 'close_house',
            'capacity' => 6000,
            'area_m2' => 300,
            'is_active' => true,
        ]);

        $cycle = \App\Models\Cycle::create([
            'coop_id' => $coop->id,
            'doc_date' => now()->subDays(12)->toDateString(),
            'doc_count' => 6000,
            'strain' => 'Cobb',
            'target_days' => 35,
            'status' => 'active',
        ]);

        // Seed FCR 7-day history daily records
        for ($i = 1; $i <= 12; $i++) {
            $recordDate = now()->subDays(13 - $i)->toDateString();
            $fcr = 1.1 + ($i * 0.03) + rand(-15, 15) / 1000;
            $mr = 0.1 + ($i * 0.08);
            $weight = 45 + ($i * 32);
            $livePop = 6000 - round($mr * 60);

            \App\Models\DailyRecord::create([
                'cycle_id' => $cycle->id,
                'record_date' => $recordDate,
                'day_number' => $i,
                'feed_kg' => 250.0 + ($i * 12.5),
                'mortality' => rand(0, 2),
                'avg_weight_g' => $weight,
                'live_population' => $livePop,
                'cum_feed_kg' => 250.0 * $i,
                'cum_mortality' => round($mr * 60),
                'fcr_current' => $fcr,
                'mortality_rate' => $mr,
                'condition' => 'good',
            ]);
        }

        // Seed golden timeline tasks via service
        \App\Services\GoldenTimelineService::seedForCycle($cycle);

        // Seed weather cache
        \App\Models\WeatherCache::create([
            'farm_id' => $farm->id,
            'temperature_c' => 33.4,
            'humidity_pct' => 70,
            'weather_desc' => 'Cerah Berawan',
            'wind_speed' => 2.5,
            'alert_level' => 'warning',
            'alert_message' => 'Suhu tinggi — aktifkan ventilasi ekstra dan tambah air minum.',
            'fetched_at' => now(),
        ]);

        // Seed commodity price history via the service
        app(\App\Services\CommodityService::class)->seedMockPrices();
    }
}
