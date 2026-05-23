<?php

namespace App\Services;

use App\Models\Farm;
use App\Models\WeatherCache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class WeatherService
{
    /**
     * Fetch weather data for a farm and store it in cache.
     */
    public function fetchForFarm(Farm $farm): void
    {
        $key = config('services.openweathermap.key');
        $baseUrl = config('services.openweathermap.base_url', 'https://api.openweathermap.org/data/2.5');

        if (empty($key)) {
            Log::warning("OpenWeatherMap API key is not configured. Skipping weather fetch for Farm ID: {$farm->id}.");
            return;
        }

        $lat = $farm->latitude ?? -6.2088; // Default to Jakarta coordinates if null
        $lon = $farm->longitude ?? 106.8456;

        try {
            $response = Http::get("{$baseUrl}/forecast", [
                'lat' => $lat,
                'lon' => $lon,
                'units' => 'metric',
                'appid' => $key,
            ]);

            if ($response->failed()) {
                Log::error("Failed to fetch weather for Farm ID {$farm->id}: " . $response->body());
                return;
            }

            $data = $response->json();
            
            $temp = 25.0;
            $humidity = 60;
            $weatherDesc = 'Cerah';
            $windSpeed = 0.0;

            if (isset($data['list'][0])) {
                $first = $data['list'][0];
                $temp = isset($first['main']['temp']) ? (float) $first['main']['temp'] : $temp;
                $humidity = isset($first['main']['humidity']) ? (int) $first['main']['humidity'] : $humidity;
                $weatherDesc = $first['weather'][0]['description'] ?? $weatherDesc;
                $windSpeed = isset($first['wind']['speed']) ? (float) $first['wind']['speed'] : $windSpeed;
            } elseif (isset($data['main'])) {
                // Fallback structure in case it's a current weather response
                $temp = isset($data['main']['temp']) ? (float) $data['main']['temp'] : $temp;
                $humidity = isset($data['main']['humidity']) ? (int) $data['main']['humidity'] : $humidity;
                $weatherDesc = $data['weather'][0]['description'] ?? $weatherDesc;
                $windSpeed = isset($data['wind']['speed']) ? (float) $data['wind']['speed'] : $windSpeed;
            }

            $alert = $this->evaluateAlert($temp, $humidity);

            $today = Carbon::today()->toDateString();
            $cache = WeatherCache::where('farm_id', $farm->id)
                ->whereDate('fetched_at', $today)
                ->first();

            if ($cache) {
                $cache->update([
                    'temperature_c' => $temp,
                    'humidity_pct' => $humidity,
                    'weather_desc' => $weatherDesc,
                    'wind_speed' => $windSpeed,
                    'alert_level' => $alert['level'],
                    'alert_message' => $alert['message'],
                    'fetched_at' => now(),
                ]);
            } else {
                WeatherCache::create([
                    'farm_id' => $farm->id,
                    'temperature_c' => $temp,
                    'humidity_pct' => $humidity,
                    'weather_desc' => $weatherDesc,
                    'wind_speed' => $windSpeed,
                    'alert_level' => $alert['level'],
                    'alert_message' => $alert['message'],
                    'fetched_at' => now(),
                ]);
            }

        } catch (\Exception $e) {
            Log::error("Exception occurred while fetching weather for Farm ID {$farm->id}: " . $e->getMessage());
        }
    }

    /**
     * Evaluate alert level and message based on temperature and humidity thresholds.
     */
    public function evaluateAlert(float $temp, float $humidity): array
    {
        if ($temp >= 36) {
            return [
                'level' => 'critical',
                'message' => 'Suhu ekstrem! Risiko heat stress massal.',
            ];
        }

        if ($temp >= 33) {
            return [
                'level' => 'warning',
                'message' => 'Suhu tinggi — aktifkan ventilasi ekstra dan tambah air minum.',
            ];
        }

        if ($temp <= 18) {
            return [
                'level' => 'warning',
                'message' => 'Suhu dingin — cek pemanas brooder.',
            ];
        }

        if ($humidity >= 85) {
            return [
                'level' => 'warning',
                'message' => 'Kelembaban sangat tinggi — risiko penyakit dan litter basah.',
            ];
        }

        return [
            'level' => 'normal',
            'message' => null,
        ];
    }
}
