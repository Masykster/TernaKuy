<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FarmController;
use App\Http\Controllers\CoopController;
use App\Http\Controllers\CycleController;
use App\Http\Controllers\TimelineTaskController;
use App\Http\Controllers\DailyRecordController;
use App\Http\Controllers\HealthRecordController;
use App\Http\Controllers\CommodityController;
use App\Http\Controllers\HarvestRecordController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'active'])->group(function () {
    // Onboarding (user has no farm yet, so onboarding.completed middleware is NOT applied here)
    Route::get('/onboarding', [OnboardingController::class, 'show'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

    // Onboarding Completed Routes
    Route::middleware(['onboarding.completed'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/commodity', [CommodityController::class, 'index'])->name('commodity.index');
        
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        // Farm CRUD
        Route::get('/farms', [FarmController::class, 'index'])->name('farms.index');
        Route::post('/farms', [FarmController::class, 'store'])->name('farms.store');
        Route::get('/farms/{farm}', [FarmController::class, 'show'])->name('farms.show');
        Route::patch('/farms/{farm}', [FarmController::class, 'update'])->name('farms.update');
        Route::delete('/farms/{farm}', [FarmController::class, 'destroy'])->name('farms.destroy');

        // Nested Coop CRUD under Farm
        Route::get('/farms/{farm}/coops', [CoopController::class, 'index'])->name('coops.index');
        Route::post('/farms/{farm}/coops', [CoopController::class, 'store'])->name('coops.store');
        Route::patch('/farms/{farm}/coops/{coop}', [CoopController::class, 'update'])->name('coops.update');
        Route::delete('/farms/{farm}/coops/{coop}', [CoopController::class, 'destroy'])->name('coops.destroy');

        // Cycle operations
        Route::get('/cycles', [CycleController::class, 'index'])->name('cycles.index');
        Route::get('/cycles/create', [CycleController::class, 'create'])->name('cycle.create');
        Route::post('/cycles', [CycleController::class, 'store'])->name('cycles.store');
        Route::get('/cycles/{cycle}', [CycleController::class, 'show'])->name('cycle.show');
        Route::patch('/cycles/{cycle}', [CycleController::class, 'update'])->name('cycles.update');
        Route::post('/cycles/{cycle}/harvest', [HarvestRecordController::class, 'store'])->middleware('withdrawal.safe')->name('cycles.harvest');
        Route::get('/cycles/{cycle}/withdrawal', [CycleController::class, 'withdrawal'])->name('cycles.withdrawal');
        Route::get('/cycles/{cycle}/report', [ReportController::class, 'show'])->name('cycles.report');
        Route::get('/cycles/{cycle}/report/download', [ReportController::class, 'download'])->name('cycles.report.download');

        // Health records operations
        Route::get('/cycles/{cycle}/health', [HealthRecordController::class, 'index'])->name('cycles.health.index');
        Route::post('/cycles/{cycle}/health', [HealthRecordController::class, 'store'])->name('cycles.health.store');
        Route::delete('/cycles/{cycle}/health/{record}', [HealthRecordController::class, 'destroy'])->name('cycles.health.destroy');

        // Daily records operations
        Route::get('/cycles/{cycle}/records/create', [DailyRecordController::class, 'create'])->name('cycles.records.create');
        Route::post('/cycles/{cycle}/records', [DailyRecordController::class, 'store'])->name('cycles.records.store');
        Route::get('/cycles/{cycle}/records', [DailyRecordController::class, 'index'])->name('cycles.records.index');
        Route::get('/cycles/{cycle}/records/{date}', [DailyRecordController::class, 'show'])->name('cycles.records.show');
        Route::patch('/cycles/{cycle}/records/{date}', [DailyRecordController::class, 'update'])->name('cycles.records.update');

        // Timeline task interaction
        Route::post('/cycles/{cycle}/timeline', [TimelineTaskController::class, 'store'])->name('timeline-tasks.store');
        Route::patch('/cycles/{cycle}/timeline/{task}', [TimelineTaskController::class, 'toggle'])->name('timeline-tasks.toggle');
    });
});

require __DIR__.'/auth.php';
