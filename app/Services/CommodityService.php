<?php

namespace App\Services;

use App\Models\CommodityPrice;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CommodityService
{
    /**
     * Fetch latest commodity rates and store them.
     */
    public function fetchAndStore(): void
    {
        $commKey = config('services.commodities.key');
        $erKey = config('services.exchangerate.key');

        if (empty($commKey) || empty($erKey)) {
            Log::warning("Commodity or ExchangeRate API key is missing. Seeding fallback mock prices.");
            $this->seedMockPrices();
            return;
        }

        try {
            // 1. Fetch commodities from commodities-api.com
            $commResponse = Http::get("https://commodities-api.com/api/latest", [
                'access_key' => $commKey,
                'symbols' => 'CORN,SOYBEAN,RICEBRAN',
            ]);

            // 2. Fetch USD to IDR rate from exchangerate-api.com
            $erResponse = Http::get("https://v6.exchangerate-api.com/v6/{$erKey}/latest/USD");

            if ($commResponse->failed() || $erResponse->failed()) {
                Log::error("Failed to fetch data from external APIs. Falling back to mock prices.");
                $this->seedMockPrices();
                return;
            }

            $commData = $commResponse->json();
            $erData = $erResponse->json();

            $rates = $commData['data']['rates'] ?? [];
            $usdToIdr = $erData['conversion_rates']['IDR'] ?? $erData['rates']['IDR'] ?? 16000.0;

            $todayStr = Carbon::today()->toDateString();

            foreach (['CORN', 'SOYBEAN', 'RICEBRAN'] as $symbol) {
                // In Commodities API, rates are usually base currency (USD) per unit of commodity or units per USD.
                // Normally it is units of commodity per 1 USD (so rate is like 0.0053 tons per 1 USD).
                // Price in USD per unit is 1 / rate.
                $rateVal = isset($rates[$symbol]) ? (float) $rates[$symbol] : 0.0;
                $priceUsd = $rateVal > 0 ? (1.0 / $rateVal) : 0.0;

                // price_idr = price_usd * usd_to_idr / 1000 (convert USD/ton to IDR/kg)
                $priceIdr = ($priceUsd * $usdToIdr) / 1000.0;

                if ($priceIdr <= 0) {
                    continue;
                }

                // Query average price of last 30 days
                $avg30d = $this->avg30d($symbol);
                if ($avg30d <= 0) {
                    $avg30d = $priceIdr;
                }

                // change_pct_30d = ((todayPrice - avg30d) / avg30d) * 100
                $changePct = (($priceIdr - $avg30d) / $avg30d) * 100;

                CommodityPrice::updateOrCreate(
                    ['commodity' => $symbol, 'recorded_date' => $todayStr],
                    [
                        'price_usd' => $priceUsd,
                        'price_idr' => $priceIdr,
                        'change_pct_30d' => $changePct,
                        'source' => 'Commodities API / ExchangeRate API',
                    ]
                );
            }

        } catch (\Exception $e) {
            Log::error("Exception occurred in CommodityService: " . $e->getMessage());
            Log::info("Falling back to seeding mock prices.");
            $this->seedMockPrices();
        }
    }

    /**
     * Get 30-day average price for a commodity.
     */
    public function avg30d(string $commodity): float
    {
        $thirtyDaysAgo = Carbon::today()->subDays(30);

        $avg = CommodityPrice::where('commodity', $commodity)
            ->where('recorded_date', '>=', $thirtyDaysAgo)
            ->avg('price_idr');

        return $avg ? (float) $avg : 0.0;
    }

    /**
     * Get bulk buy recommendations based on price drops.
     */
    public function getBulkBuyRecommendations(float $remainingFeedKg = 0): array
    {
        $commodities = ['CORN', 'SOYBEAN', 'RICEBRAN'];
        $recommendations = [];
        $noRecommendations = [];

        foreach ($commodities as $comm) {
            $latest = CommodityPrice::where('commodity', $comm)
                ->orderBy('recorded_date', 'desc')
                ->first();

            if (!$latest) {
                continue;
            }

            $todayPrice = (float) $latest->price_idr;
            $avg30d = $this->avg30d($comm);

            if ($avg30d <= 0) {
                $avg30d = $todayPrice;
            }

            // Drop is calculated as (avg - today) / avg * 100.
            // If drop >= 5%, price is at least 5% below average, indicating a recommendation.
            $dropPct = (($avg30d - $todayPrice) / $avg30d) * 100;

            if ($dropPct >= 5.0) {
                $savingsPerKg = $avg30d - $todayPrice;
                $totalSavings = $savingsPerKg * $remainingFeedKg;

                $recommendations[] = [
                    'commodity' => $comm,
                    'today_price' => $todayPrice,
                    'avg_30d' => $avg30d,
                    'drop_pct' => round($dropPct, 1),
                    'savings_per_kg' => round($savingsPerKg, 2),
                    'total_savings' => round($totalSavings, 2),
                ];
            } else {
                $noRecommendations[] = [
                    'commodity' => $comm,
                    'today_price' => $todayPrice,
                    'avg_30d' => $avg30d,
                    'change_pct' => round((($todayPrice - $avg30d) / $avg30d) * 100, 1),
                ];
            }
        }

        return [
            'recommendations' => $recommendations,
            'no_recommendations' => $noRecommendations,
        ];
    }

    /**
     * Seeds dummy commodity history for testing and verification.
     */
    public function seedMockPrices(): void
    {
        // Setup base prices to simulate a drop in CORN and RICEBRAN
        $commodities = [
            'CORN' => ['base_price' => 4200, 'trend' => -20], 
            'SOYBEAN' => ['base_price' => 7000, 'trend' => 12], 
            'RICEBRAN' => ['base_price' => 3100, 'trend' => -10],
        ];

        $today = Carbon::today();

        for ($i = 30; $i >= 0; $i--) {
            $date = (clone $today)->subDays($i);

            foreach ($commodities as $comm => $info) {
                // Apply a linear trend with some small daily random noise
                $priceIdr = $info['base_price'] + ($info['trend'] * (30 - $i)) + rand(-30, 30);
                $priceUsd = $priceIdr * 1000 / 16000;

                // Let's compute average before saving to calculate change_pct_30d
                $avg = CommodityPrice::where('commodity', $comm)
                    ->where('recorded_date', '>=', (clone $date)->subDays(30))
                    ->where('recorded_date', '<', $date)
                    ->avg('price_idr');
                
                $avgVal = $avg ? (float) $avg : ($priceIdr * 1.05); // Start with slightly higher average to simulate drop
                $changePct = (($priceIdr - $avgVal) / $avgVal) * 100;

                CommodityPrice::updateOrCreate(
                    ['commodity' => $comm, 'recorded_date' => $date->toDateString()],
                    [
                        'price_usd' => $priceUsd / 1000,
                        'price_idr' => $priceIdr,
                        'change_pct_30d' => $changePct,
                        'source' => 'Mock/Fallback API',
                    ]
                );
            }
        }
    }
}
