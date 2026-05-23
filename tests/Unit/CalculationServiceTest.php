<?php

use App\Services\CalculationService;

beforeEach(function () {
    $this->calculationService = new CalculationService();
});

test('FCR running dengan avg_weight_g diisi -> nilai benar', function () {
    $input = [
        'feed_kg' => 10,
        'mortality' => 0,
        'avg_weight_g' => 50,
    ];
    $prev = [
        'live_population' => 1000,
        'cum_feed_kg' => 40.0,
        'cum_mortality' => 0,
    ];
    $initialDoc = 1000;

    $result = $this->calculationService->calculateDaily($input, $prev, $initialDoc);

    // cum_feed = 40 + 10 = 50 kg
    // live_population = 1000
    // avg_weight_g = 50
    // FCR = 50 / ((1000 * 50) / 1000) = 50 / 50 = 1.0
    expect($result['fcr_current'])->toBe(1.0);
});

test('FCR running tanpa avg_weight_g -> null (tidak error)', function () {
    $input = [
        'feed_kg' => 10,
        'mortality' => 0,
        'avg_weight_g' => null,
    ];
    $prev = [
        'live_population' => 1000,
        'cum_feed_kg' => 40.0,
        'cum_mortality' => 0,
    ];
    $initialDoc = 1000;

    $result = $this->calculationService->calculateDaily($input, $prev, $initialDoc);

    expect($result['fcr_current'])->toBeNull();
});

test('mortality_rate kalkulasi benar', function () {
    $input = [
        'feed_kg' => 10,
        'mortality' => 10,
        'avg_weight_g' => 50,
    ];
    $prev = [
        'live_population' => 1000,
        'cum_feed_kg' => 40.0,
        'cum_mortality' => 10,
    ];
    $initialDoc = 1000;

    $result = $this->calculationService->calculateDaily($input, $prev, $initialDoc);

    // cum_mortality = 10 (prev) + 10 (input) = 20
    // mortality_rate = (20 / 1000) * 100 = 2.0%
    expect($result['mortality_rate'])->toBe(2.0);
    expect($result['cum_mortality'])->toBe(20);
    expect($result['live_population'])->toBe(990);
});

test('IP score formula benar', function () {
    $cycle = [
        'doc_date' => '2026-05-01',
        'doc_count' => 1000,
    ];
    $harvest = [
        'harvest_date' => '2026-05-31', // age = 30 days
        'total_weight_kg' => 1500,
        'harvest_count' => 950,
        'price_per_kg' => 20000,
    ];
    $summary = [
        'sum_feed_kg' => 2400,
        'sum_mortality' => 50,
    ];

    $result = $this->calculationService->calculateHarvest($cycle, $harvest, $summary);

    // age = 30
    // avg_weight_kg = 1500 / 950 = 1.5789...
    // fcr_final = 2400 / 1500 = 1.6
    // mortality_rate = 50 / 1000 * 100 = 5.0%
    // survival_rate = 95.0%
    // ipScore = (0.95 * 1.578947) / (1.6 * 30) * 100 = 1.5 / 48 * 100 = 3.125
    expect(round($result['ip_score'], 3))->toBe(3.125);
    expect((int) $result['harvest_age_days'])->toBe(30);
    expect($result['avg_weight_kg'])->toBe(1500 / 950);
    expect($result['fcr_final'])->toBe(1.6);
});

test('condition = critical jika FCR > 1.9', function () {
    $input = [
        'feed_kg' => 100,
        'mortality' => 0,
        'avg_weight_g' => 50,
    ];
    $prev = [
        'live_population' => 1000,
        'cum_feed_kg' => 90.0, // cum_feed = 190. FCR = 190 / 50 = 3.8 (> 1.9)
        'cum_mortality' => 0,
    ];
    $initialDoc = 1000;

    $result = $this->calculationService->calculateDaily($input, $prev, $initialDoc);

    expect($result['condition'])->toBe('critical');
});

test('condition = warning jika FCR > 1.6', function () {
    $input = [
        'feed_kg' => 85,
        'mortality' => 0,
        'avg_weight_g' => 50,
    ];
    $prev = [
        'live_population' => 1000,
        'cum_feed_kg' => 0.0, // cum_feed = 85. FCR = 85 / 50 = 1.7 (> 1.6)
        'cum_mortality' => 0,
    ];
    $initialDoc = 1000;

    $result = $this->calculationService->calculateDaily($input, $prev, $initialDoc);

    expect($result['condition'])->toBe('warning');
});
