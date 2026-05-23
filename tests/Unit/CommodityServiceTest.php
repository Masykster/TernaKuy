<?php

use App\Models\CommodityPrice;
use App\Services\CommodityService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->commodityService = new CommodityService();
});

test('bulk_buy trigger jika drop >= 5%', function () {
    Carbon::setTestNow('2026-05-31');

    // Seed historical commodity prices to create a 30-day average of 5000 IDR (including today's 4700)
    // (5060 * 5 + 4700) / 6 = 5000
    for ($i = 1; $i <= 5; $i++) {
        CommodityPrice::create([
            'commodity' => 'CORN',
            'price_idr' => 5060,
            'recorded_date' => Carbon::today()->subDays($i)->toDateString(),
        ]);
    }

    // Today's price is 4700 IDR (drop of (5000 - 4700)/5000 = 6% which is >= 5%)
    CommodityPrice::create([
        'commodity' => 'CORN',
        'price_idr' => 4700,
        'recorded_date' => Carbon::today()->toDateString(),
    ]);

    // Stub other commodities so they don't break or trigger recommendations
    foreach (['SOYBEAN', 'RICEBRAN'] as $comm) {
        CommodityPrice::create([
            'commodity' => $comm,
            'price_idr' => 5000,
            'recorded_date' => Carbon::today()->toDateString(),
        ]);
    }

    $result = $this->commodityService->getBulkBuyRecommendations(100);

    expect($result['recommendations'])->toHaveCount(1);
    expect($result['recommendations'][0]['commodity'])->toBe('CORN');
    expect($result['recommendations'][0]['drop_pct'])->toBe(6.0); // (5000 - 4700) / 5000 * 100 = 6%
    expect($result['recommendations'][0]['savings_per_kg'])->toBe(300.0); // 5000 - 4700 = 300
    expect($result['recommendations'][0]['total_savings'])->toBe(30000.0); // 300 * 100 = 30000
});

test('tidak ada recommendation jika drop < 5%', function () {
    Carbon::setTestNow('2026-05-31');

    // Seed historical commodity prices to create a 30-day average of 5000 IDR (including today's 4800)
    // (5040 * 5 + 4800) / 6 = 5000
    for ($i = 1; $i <= 5; $i++) {
        CommodityPrice::create([
            'commodity' => 'CORN',
            'price_idr' => 5040,
            'recorded_date' => Carbon::today()->subDays($i)->toDateString(),
        ]);
    }

    // Today's price is 4800 IDR (drop of (5000 - 4800)/5000 = 4% which is < 5%)
    CommodityPrice::create([
        'commodity' => 'CORN',
        'price_idr' => 4800,
        'recorded_date' => Carbon::today()->toDateString(),
    ]);

    // Stub other commodities
    foreach (['SOYBEAN', 'RICEBRAN'] as $comm) {
        CommodityPrice::create([
            'commodity' => $comm,
            'price_idr' => 5000,
            'recorded_date' => Carbon::today()->toDateString(),
        ]);
    }

    $result = $this->commodityService->getBulkBuyRecommendations(100);

    expect($result['recommendations'])->toHaveCount(0);
    expect($result['no_recommendations'])->toHaveCount(3);
});

test('savings_per_kg = avg30d - today_price', function () {
    Carbon::setTestNow('2026-05-31');

    // Seed historical to make average 10000 (including today's 9000)
    // (11000 + 9000) / 2 = 10000
    CommodityPrice::create([
        'commodity' => 'SOYBEAN',
        'price_idr' => 11000,
        'recorded_date' => Carbon::today()->subDays(1)->toDateString(),
    ]);

    // Today's price is 9000 IDR (drop of 10% >= 5%)
    CommodityPrice::create([
        'commodity' => 'SOYBEAN',
        'price_idr' => 9000,
        'recorded_date' => Carbon::today()->toDateString(),
    ]);

    // Stub other commodities
    foreach (['CORN', 'RICEBRAN'] as $comm) {
        CommodityPrice::create([
            'commodity' => $comm,
            'price_idr' => 5000,
            'recorded_date' => Carbon::today()->toDateString(),
        ]);
    }

    $result = $this->commodityService->getBulkBuyRecommendations(50);

    $recommendation = collect($result['recommendations'])->firstWhere('commodity', 'SOYBEAN');
    expect($recommendation)->not->toBeNull();
    expect($recommendation['savings_per_kg'])->toBe(1000.0); // 10000 - 9000 = 1000
    expect($recommendation['total_savings'])->toBe(50000.0); // 1000 * 50 = 50000
});
