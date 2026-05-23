<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        \App\Models\Cycle::observe(\App\Observers\CycleObserver::class);
        \App\Models\DailyRecord::observe(\App\Observers\DailyRecordObserver::class);
        \App\Models\HealthRecord::observe(\App\Observers\HealthRecordObserver::class);
    }
}
