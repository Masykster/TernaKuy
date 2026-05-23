<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\FetchWeatherJob;
use App\Jobs\FetchCommodityJob;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new FetchWeatherJob)->everyThreeHours();
Schedule::job(new FetchCommodityJob)->dailyAt('08:00')->timezone('Asia/Jakarta');
