<?php

use App\Models\Cycle;
use App\Models\Coop;
use App\Models\Farm;
use App\Models\User;
use App\Models\HealthRecord;
use App\Services\WithdrawalService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->withdrawalService = new WithdrawalService();
});

test('withdrawal_end = record_date + withdrawal_days', function () {
    $recordDate = '2026-05-01';
    $withdrawalDays = 5;

    $end = $this->withdrawalService->computeEndDate($recordDate, $withdrawalDays);

    expect($end)->toBe('2026-05-06');
});

test('has_active = true jika ada withdrawal belum selesai', function () {
    Carbon::setTestNow('2026-05-05');

    // Create models
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test_' . uniqid() . '@example.com',
        'password' => bcrypt('password'),
    ]);
    $farm = Farm::create([
        'user_id' => $user->id,
        'name' => 'Farm 1',
        'address' => 'Addr 1',
        'latitude' => -6.2,
        'longitude' => 106.8,
        'is_active' => true,
    ]);
    $coop = Coop::create([
        'farm_id' => $farm->id,
        'coop_code' => 'Kandang A1',
        'coop_type' => 'close_house',
        'capacity' => 10000,
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

    HealthRecord::create([
        'cycle_id' => $cycle->id,
        'record_date' => '2026-05-03',
        'record_type' => 'treatment',
        'drug_name' => 'Amox',
        'withdrawal_days' => 5, // end date: 2026-05-08. today is 2026-05-05 (3 days left, active)
    ]);

    $status = $this->withdrawalService->getWithdrawalStatus($cycle->id);

    expect($status['has_active'])->toBeTrue();
    expect($status['is_safe_to_harvest'])->toBeFalse();
    expect($status['active_withdrawals'])->toHaveCount(1);
    expect($status['active_withdrawals'][0]['days_left'])->toBe(3);
});

test('has_active = false jika semua withdrawal sudah lewat', function () {
    Carbon::setTestNow('2026-05-10');

    $user = User::create([
        'name' => 'Test User',
        'email' => 'test_' . uniqid() . '@example.com',
        'password' => bcrypt('password'),
    ]);
    $farm = Farm::create([
        'user_id' => $user->id,
        'name' => 'Farm 1',
        'address' => 'Addr 1',
        'latitude' => -6.2,
        'longitude' => 106.8,
        'is_active' => true,
    ]);
    $coop = Coop::create([
        'farm_id' => $farm->id,
        'coop_code' => 'Kandang A1',
        'coop_type' => 'close_house',
        'capacity' => 10000,
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

    HealthRecord::create([
        'cycle_id' => $cycle->id,
        'record_date' => '2026-05-03',
        'record_type' => 'treatment',
        'drug_name' => 'Amox',
        'withdrawal_days' => 5, // end date: 2026-05-08. today is 2026-05-10 (over, safe)
    ]);

    $status = $this->withdrawalService->getWithdrawalStatus($cycle->id);

    expect($status['has_active'])->toBeFalse();
    expect($status['is_safe_to_harvest'])->toBeTrue();
    expect($status['active_withdrawals'])->toHaveCount(0);
});

test('safe_harvest_date = tanggal withdrawal_end paling akhir', function () {
    Carbon::setTestNow('2026-05-05');

    $user = User::create([
        'name' => 'Test User',
        'email' => 'test_' . uniqid() . '@example.com',
        'password' => bcrypt('password'),
    ]);
    $farm = Farm::create([
        'user_id' => $user->id,
        'name' => 'Farm 1',
        'address' => 'Addr 1',
        'latitude' => -6.2,
        'longitude' => 106.8,
        'is_active' => true,
    ]);
    $coop = Coop::create([
        'farm_id' => $farm->id,
        'coop_code' => 'Kandang A1',
        'coop_type' => 'close_house',
        'capacity' => 10000,
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

    HealthRecord::create([
        'cycle_id' => $cycle->id,
        'record_date' => '2026-05-03',
        'record_type' => 'treatment',
        'drug_name' => 'Amox',
        'withdrawal_days' => 5, // end date: 2026-05-08
    ]);

    HealthRecord::create([
        'cycle_id' => $cycle->id,
        'record_date' => '2026-05-04',
        'record_type' => 'treatment',
        'drug_name' => 'Tetracycline',
        'withdrawal_days' => 6, // end date: 2026-05-10
    ]);

    $status = $this->withdrawalService->getWithdrawalStatus($cycle->id);

    expect($status['safe_harvest_date'])->toBe('2026-05-10');
});

test('days_left = 0 jika withdrawal sudah selesai (bukan negatif)', function () {
    Carbon::setTestNow('2026-05-15');

    $user = User::create([
        'name' => 'Test User',
        'email' => 'test_' . uniqid() . '@example.com',
        'password' => bcrypt('password'),
    ]);
    $farm = Farm::create([
        'user_id' => $user->id,
        'name' => 'Farm 1',
        'address' => 'Addr 1',
        'latitude' => -6.2,
        'longitude' => 106.8,
        'is_active' => true,
    ]);
    $coop = Coop::create([
        'farm_id' => $farm->id,
        'coop_code' => 'Kandang A1',
        'coop_type' => 'close_house',
        'capacity' => 10000,
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

    HealthRecord::create([
        'cycle_id' => $cycle->id,
        'record_date' => '2026-05-03',
        'record_type' => 'treatment',
        'drug_name' => 'Amox',
        'withdrawal_days' => 5, // end date: 2026-05-08
    ]);

    $status = $this->withdrawalService->getWithdrawalStatus($cycle->id);

    expect($status['all_withdrawals'][0]['days_left'])->toBe(0);
});
