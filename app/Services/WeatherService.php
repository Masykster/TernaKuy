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

        [$lat, $lon] = $this->resolveCoordinates($farm);

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

    /**
     * Get weather forecast for a farm, cached for 3 hours.
     */
    public function getForecast(Farm $farm): array
    {
        $cacheKey = "weather_forecast_farm_{$farm->id}";
        
        return \Illuminate\Support\Facades\Cache::remember($cacheKey, 10800, function () use ($farm) {
            $key = config('services.openweathermap.key');
            $baseUrl = config('services.openweathermap.base_url', 'https://api.openweathermap.org/data/2.5');

            if (empty($key)) {
                Log::warning("OpenWeatherMap API key is not configured. Returning fallback mock forecast for Farm ID: {$farm->id}.");
                return $this->getFallbackForecast();
            }

            [$lat, $lon] = $this->resolveCoordinates($farm);

            try {
                $response = Http::get("{$baseUrl}/forecast", [
                    'lat' => $lat,
                    'lon' => $lon,
                    'units' => 'metric',
                    'appid' => $key,
                ]);

                if ($response->failed()) {
                    Log::error("Failed to fetch weather forecast for Farm ID {$farm->id}: " . $response->body());
                    return $this->getFallbackForecast();
                }

                $data = $response->json();
                if (!isset($data['list']) || !is_array($data['list'])) {
                    return $this->getFallbackForecast();
                }

                // Group by day string (YYYY-MM-DD)
                $grouped = [];
                foreach ($data['list'] as $item) {
                    $dt = Carbon::parse($item['dt']);
                    $dateStr = $dt->toDateString();
                    $hour = $dt->hour;

                    if (!isset($grouped[$dateStr])) {
                        $grouped[$dateStr] = [];
                    }
                    $grouped[$dateStr][] = [
                        'hour_diff_from_midday' => abs($hour - 12),
                        'temp' => isset($item['main']['temp']) ? (float) $item['main']['temp'] : 25.0,
                        'humidity' => isset($item['main']['humidity']) ? (int) $item['main']['humidity'] : 60,
                        'desc' => $item['weather'][0]['description'] ?? 'Cerah',
                        'main_weather' => $item['weather'][0]['main'] ?? 'Clear',
                    ];
                }

                $forecasts = [];
                foreach ($grouped as $dateStr => $points) {
                    // Select point closest to 12:00 PM (midday)
                    usort($points, function ($a, $b) {
                        return $a['hour_diff_from_midday'] <=> $b['hour_diff_from_midday'];
                    });
                    
                    $bestPoint = $points[0];
                    
                    $descIndo = $this->translateDescription($bestPoint['desc'], $bestPoint['main_weather']);
                    $icon = $this->mapWeatherIcon($bestPoint['desc'], $bestPoint['main_weather']);
                    $alert = ($bestPoint['temp'] >= 33 || $bestPoint['humidity'] >= 85);

                    $forecasts[] = [
                        'date' => $dateStr,
                        'temp' => round($bestPoint['temp']),
                        'desc' => $descIndo,
                        'icon' => $icon,
                        'humidity' => $bestPoint['humidity'],
                        'alert' => $alert,
                    ];
                }

                return array_slice($forecasts, 0, 7);

            } catch (\Exception $e) {
                Log::error("Exception occurred while fetching forecast for Farm ID {$farm->id}: " . $e->getMessage());
                return $this->getFallbackForecast();
            }
        });
    }

    /**
     * Get fallback mock forecast relative to the current date.
     */
    public function getFallbackForecast(): array
    {
        $forecasts = [];
        $today = Carbon::today();
        
        $mockData = [
            ['temp' => 27, 'humidity' => 60, 'desc' => 'Cerah Berawan', 'icon' => '/images/CUACA - CERAH BERAWAN.png', 'alert' => false],
            ['temp' => 26, 'humidity' => 75, 'desc' => 'Hujan Ringan', 'icon' => '/images/HUJAN RINGAN.png', 'alert' => false],
            ['temp' => 29, 'humidity' => 70, 'desc' => 'Berawan', 'icon' => '/images/BERAWAN.png', 'alert' => false],
            ['temp' => 31, 'humidity' => 60, 'desc' => 'Cerah Berawan', 'icon' => '/images/CUACA - CERAH BERAWAN.png', 'alert' => false],
            ['temp' => 33, 'humidity' => 55, 'desc' => 'Hujan Ringan', 'icon' => '/images/HUJAN RINGAN.png', 'alert' => false],
            ['temp' => 28, 'humidity' => 85, 'desc' => 'Hujan Lebat', 'icon' => '/images/HUJAN LEBAT.png', 'alert' => true],
            ['temp' => 30, 'humidity' => 45, 'desc' => 'Berawan', 'icon' => '/images/BERAWAN.png', 'alert' => false],
        ];

        for ($i = 0; $i < 7; $i++) {
            $date = $today->copy()->addDays($i);
            $mock = $mockData[$i];
            $forecasts[] = [
                'date' => $date->toDateString(),
                'temp' => $mock['temp'],
                'desc' => $mock['desc'],
                'icon' => $mock['icon'],
                'humidity' => $mock['humidity'],
                'alert' => $mock['alert'],
            ];
        }
        
        return $forecasts;
    }

    /**
     * Resolve coordinates from Farm lat/lon or Geocode the address.
     */
    private function resolveCoordinates(Farm $farm): array
    {
        if ($farm->latitude !== null && $farm->longitude !== null) {
            return [(float)$farm->latitude, (float)$farm->longitude];
        }

        if (!empty($farm->address)) {
            try {
                $response = Http::withHeaders([
                    'User-Agent' => 'TernaKuyApp/1.0',
                ])->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $farm->address,
                    'format' => 'json',
                    'limit' => 1,
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    if (count($data) > 0) {
                        $lat = (float)$data[0]['lat'];
                        $lon = (float)$data[0]['lon'];
                        
                        // Cache it in the DB to avoid future geocoding calls
                        $farm->update(['latitude' => $lat, 'longitude' => $lon]);

                        return [$lat, $lon];
                    }
                }
            } catch (\Exception $e) {
                Log::error("Geocoding failed for Farm ID {$farm->id}: " . $e->getMessage());
            }
        }

        return [-6.2088, 106.8456]; // Jakarta fallback
    }

    /**
     * Translate OpenWeatherMap description to Indonesian.
     */
    private function translateDescription(string $desc, string $main): string
    {
        $desc = strtolower($desc);
        
        if (str_contains($desc, 'thunderstorm')) return 'Hujan Badai';
        if (str_contains($desc, 'heavy intensity rain') || str_contains($desc, 'extreme rain') || str_contains($desc, 'very heavy rain')) return 'Hujan Lebat';
        if (str_contains($desc, 'moderate rain') || str_contains($desc, 'rain')) return 'Hujan Ringan';
        if (str_contains($desc, 'drizzle') || str_contains($desc, 'light rain')) return 'Hujan Ringan';
        if (str_contains($desc, 'broken clouds') || str_contains($desc, 'overcast clouds')) return 'Berawan';
        if (str_contains($desc, 'scattered clouds') || str_contains($desc, 'few clouds')) return 'Cerah Berawan';
        if (str_contains($desc, 'clear sky') || str_contains($desc, 'sky is clear') || $main === 'Clear') return 'Cerah';
        
        return 'Cerah Berawan';
    }

    /**
     * Map weather condition to premium local icon.
     */
    private function mapWeatherIcon(string $desc, string $main): string
    {
        $desc = strtolower($desc);
        $main = ucfirst($main);
        
        if ($main === 'Rain' || $main === 'Drizzle') {
            if (str_contains($desc, 'heavy') || str_contains($desc, 'extreme') || str_contains($desc, 'thunderstorm')) {
                return '/images/HUJAN LEBAT.png';
            }
            return '/images/HUJAN RINGAN.png';
        }
        
        if ($main === 'Thunderstorm') {
            return '/images/HUJAN LEBAT.png';
        }
        
        if ($main === 'Clouds') {
            if (str_contains($desc, 'broken') || str_contains($desc, 'overcast')) {
                return '/images/BERAWAN.png';
            }
            return '/images/CUACA - CERAH BERAWAN.png';
        }
        
        return '/images/CUACA - CERAH BERAWAN.png';
    }
}
