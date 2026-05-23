<?php

namespace App\Jobs;

use App\Models\Farm;
use App\Services\WeatherService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FetchWeatherJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(WeatherService $weatherService): void
    {
        $activeFarms = Farm::where('is_active', true)->get();

        foreach ($activeFarms as $farm) {
            $weatherService->fetchForFarm($farm);
        }
    }
}
