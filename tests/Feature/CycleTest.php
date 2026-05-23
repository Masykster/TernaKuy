<?php

use App\Models\User;
use App\Models\Farm;
use App\Models\Coop;
use App\Models\Cycle;
use App\Models\DailyRecord;
use App\Models\TimelineTask;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('store cycle -> 14 timeline tasks ter-generate', function () {
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

    $response = $this->actingAs($user)->post('/cycles', [
        'coop_id' => $coop->id,
        'doc_date' => '2026-05-01',
        'doc_count' => 5000,
        'strain' => 'Ross',
        'target_days' => 35,
    ]);

    $response->assertRedirect(route('dashboard'));

    $cycle = Cycle::where('coop_id', $coop->id)->first();
    expect($cycle)->not->toBeNull();

    // Verify 14 tasks are generated
    $tasksCount = TimelineTask::where('cycle_id', $cycle->id)->count();
    expect($tasksCount)->toBe(14);
});

test('store daily_record duplikat hari -> 422', function () {
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

    // Create first daily record
    DailyRecord::create([
        'cycle_id' => $cycle->id,
        'record_date' => '2026-05-02',
        'feed_kg' => 100,
        'mortality' => 5,
        'live_population' => 4995,
        'cum_feed_kg' => 100,
        'cum_mortality' => 5,
        'mortality_rate' => 0.1,
    ]);

    // Attempt to store second daily record on the same date via POST
    $response = $this->actingAs($user)->postJson(route('cycles.records.store', $cycle->id), [
        'record_date' => '2026-05-02',
        'feed_kg' => 120,
        'mortality' => 2,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('record_date');
});

test('mortality > live_population -> 422', function () {
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

    // Attempt to record mortality (6000) > initial population (5000)
    $response = $this->actingAs($user)->postJson(route('cycles.records.store', $cycle->id), [
        'record_date' => '2026-05-02',
        'feed_kg' => 100,
        'mortality' => 6000,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('mortality');
});

test('FCR auto-kalkulasi setelah daily_record created', function () {
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
        'doc_count' => 1000,
        'strain' => 'Ross',
        'target_days' => 35,
        'status' => 'active',
    ]);

    // Create daily record with avg_weight_g filled to trigger FCR calculation
    $response = $this->actingAs($user)->post(route('cycles.records.store', $cycle->id), [
        'record_date' => '2026-05-02',
        'feed_kg' => 100,
        'mortality' => 0,
        'avg_weight_g' => 100, // live pop = 1000, weight = 100g -> total biomass = 100kg. cum feed = 100kg. FCR = 100 / 100 = 1.0
    ]);

    $record = DailyRecord::where('cycle_id', $cycle->id)->first();
    expect($record)->not->toBeNull();
    expect((float) $record->fcr_current)->toBe(1.0);
});
