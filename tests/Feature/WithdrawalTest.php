<?php

use App\Models\User;
use App\Models\Farm;
use App\Models\Coop;
use App\Models\Cycle;
use App\Models\HealthRecord;
use App\Models\DailyRecord;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('harvest saat withdrawal aktif -> 422', function () {
    Carbon::setTestNow('2026-05-05');

    $user = User::create([
        'name' => 'Peternak Hebat',
        'email' => 'hebat@example.com',
        'password' => bcrypt('password123'),
        'is_active' => true,
    ]);
    $farm = Farm::create([
        'user_id' => $user->id,
        'name' => 'Farm Bogor',
        'address' => 'Bogor',
        'latitude' => -6.5,
        'longitude' => 106.8,
        'is_active' => true,
    ]);
    $coop = Coop::create([
        'farm_id' => $farm->id,
        'coop_code' => 'Kandang B1',
        'coop_type' => 'close_house',
        'capacity' => 8000,
        'is_active' => true,
    ]);
    $cycle = Cycle::create([
        'coop_id' => $coop->id,
        'doc_date' => '2026-05-01',
        'doc_count' => 5000,
        'strain' => 'Ross',
        'target_days' => 35,
        'status' => 'active',
    ]);

    // Give treatment today with 5 withdrawal days (ends on 2026-05-10, today is 2026-05-05)
    HealthRecord::create([
        'cycle_id' => $cycle->id,
        'record_date' => '2026-05-05',
        'record_type' => 'treatment',
        'drug_name' => 'Antibiotik A',
        'withdrawal_days' => 5,
    ]);

    // Seed at least one daily record
    DailyRecord::create([
        'cycle_id' => $cycle->id,
        'record_date' => '2026-05-02',
        'feed_kg' => 100,
        'mortality' => 0,
        'avg_weight_g' => 100,
        'live_population' => 5000,
        'cum_feed_kg' => 100,
        'cum_mortality' => 0,
        'mortality_rate' => 0.0,
    ]);

    $response = $this->actingAs($user)->postJson(route('cycles.harvest', $cycle->id), [
        'harvest_date' => '2026-05-05',
        'harvest_count' => 4900,
        'total_weight_kg' => 7500,
        'price_per_kg' => 20000,
    ]);

    $response->assertStatus(422);
    $response->assertJsonStructure(['message']);
});

test('harvest setelah withdrawal selesai -> sukses', function () {
    Carbon::setTestNow('2026-05-15');

    $user = User::create([
        'name' => 'Peternak Hebat',
        'email' => 'hebat@example.com',
        'password' => bcrypt('password123'),
        'is_active' => true,
    ]);
    $farm = Farm::create([
        'user_id' => $user->id,
        'name' => 'Farm Bogor',
        'address' => 'Bogor',
        'latitude' => -6.5,
        'longitude' => 106.8,
        'is_active' => true,
    ]);
    $coop = Coop::create([
        'farm_id' => $farm->id,
        'coop_code' => 'Kandang B1',
        'coop_type' => 'close_house',
        'capacity' => 8000,
        'is_active' => true,
    ]);
    $cycle = Cycle::create([
        'coop_id' => $coop->id,
        'doc_date' => '2026-05-01',
        'doc_count' => 5000,
        'strain' => 'Ross',
        'target_days' => 35,
        'status' => 'active',
    ]);

    // Give treatment 10 days ago (ends on 2026-05-10, today is 2026-05-15)
    HealthRecord::create([
        'cycle_id' => $cycle->id,
        'record_date' => '2026-05-05',
        'record_type' => 'treatment',
        'drug_name' => 'Antibiotik A',
        'withdrawal_days' => 5,
    ]);

    // Seed at least one daily record
    DailyRecord::create([
        'cycle_id' => $cycle->id,
        'record_date' => '2026-05-02',
        'feed_kg' => 100,
        'mortality' => 0,
        'avg_weight_g' => 100,
        'live_population' => 5000,
        'cum_feed_kg' => 100,
        'cum_mortality' => 0,
        'mortality_rate' => 0.0,
    ]);

    $response = $this->actingAs($user)->post(route('cycles.harvest', $cycle->id), [
        'harvest_date' => '2026-05-15',
        'harvest_count' => 4900,
        'total_weight_kg' => 7500,
        'price_per_kg' => 20000,
    ]);

    $response->assertRedirect(route('cycles.report', ['cycle' => $cycle->id]));
});
