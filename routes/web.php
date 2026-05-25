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
use App\Http\Controllers\ChatbotController;
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

        Route::get('/setup-kandang', function (\Illuminate\Http\Request $request) {
            $user = $request->user();
            $farmId = $request->query('farm_id');
            $coopCode = $request->query('coop_code');

            if ($farmId) {
                $farm = $user->farms()->find($farmId);
            } else {
                $farm = $user->farms()->first();
            }

            if ($coopCode && $farm) {
                $coop = $farm->coops()->where('coop_code', $coopCode)->first();
            } else {
                $coop = $farm ? $farm->coops()->first() : null;
            }

            if ($coop) {
                $activeCycle = $coop->cycles()->where('status', 'active')->first();
                $coop->active_cycle_target_days = $activeCycle ? $activeCycle->target_days : 35;
            }
            return Inertia::render('SetupKandang', [
                'dbFarm' => $farm,
                'dbCoop' => $coop,
                'farmId' => $farm ? $farm->id : null,
            ]);
        })->name('setup-kandang');

        Route::post('/setup-kandang', function (\Illuminate\Http\Request $request) {
            $user = $request->user();
            $validated = $request->validate([
                'namaFarm' => 'required|string|max:100',
                'alamat' => 'nullable|string',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'kodeKandang' => 'required|string|max:20',
                'luasKandang' => 'required|numeric|min:0.01',
                'jumlahBibit' => 'required|integer|min:1',
                'komoditas' => 'required|string',
                'is_editing' => 'nullable|boolean',
                'target_days' => 'nullable|integer|min:1',
                'farm_id' => 'nullable|integer',
            ]);

            $speciesMap = [
                'Ayam' => 'broiler',
                'Bebek' => 'bebek',
                'Lele' => 'lele',
                'Nila' => 'nila',
            ];
            $species = $speciesMap[$validated['komoditas']] ?? 'broiler';

            \Illuminate\Support\Facades\DB::transaction(function () use ($user, $validated, $species, $request) {
                $farmId = $validated['farm_id'] ?? $request->input('farm_id');
                $isEditing = $request->input('is_editing');

                if ($farmId) {
                    $farm = $user->farms()->find($farmId);
                } else if ($isEditing) {
                    $farm = $user->farms()->first();
                } else {
                    $farm = null;
                }

                if (!$farm) {
                    $farm = \App\Models\Farm::create([
                        'user_id' => $user->id,
                        'name' => $validated['namaFarm'],
                        'address' => $validated['alamat'],
                        'latitude' => $validated['latitude'] ?? null,
                        'longitude' => $validated['longitude'] ?? null,
                        'species' => $species,
                        'is_active' => true,
                    ]);
                } else {
                    $farm->update([
                        'name' => $validated['namaFarm'],
                        'address' => $validated['alamat'],
                        'latitude' => $validated['latitude'] ?? null,
                        'longitude' => $validated['longitude'] ?? null,
                        'species' => $species,
                    ]);
                }

                $coop = null;
                if ($request->input('is_editing')) {
                    $coop = $farm->coops()->where('coop_code', $validated['kodeKandang'])->first() ?: $farm->coops()->first();
                }

                if (!$coop) {
                    $coop = \App\Models\Coop::create([
                        'farm_id' => $farm->id,
                        'coop_code' => $validated['kodeKandang'],
                        'coop_type' => 'close_house',
                        'capacity' => $validated['jumlahBibit'],
                        'area_m2' => $validated['luasKandang'],
                        'is_active' => true,
                    ]);
                } else {
                    $coop->update([
                        'coop_code' => $validated['kodeKandang'],
                        'capacity' => $validated['jumlahBibit'],
                        'area_m2' => $validated['luasKandang'],
                    ]);
                }

                $targetDaysInput = $request->input('target_days', 35) ?: 35;

                $activeCycle = $coop->cycles()->where('status', 'active')->first();
                if (!$activeCycle) {
                    $activeCycle = \App\Models\Cycle::create([
                        'coop_id' => $coop->id,
                        'doc_date' => \Carbon\Carbon::today()->toDateString(),
                        'doc_count' => $validated['jumlahBibit'],
                        'strain' => 'Cobb',
                        'supplier_doc' => 'Kemitraan',
                        'price_doc' => 7000,
                        'target_days' => $targetDaysInput,
                        'status' => 'active',
                    ]);
                    \App\Services\GoldenTimelineService::seedForCycle($activeCycle);
                } else {
                    $activeCycle->update([
                        'doc_count' => $validated['jumlahBibit'],
                        'target_days' => $targetDaysInput,
                    ]);
                }
            });

            return redirect()->route('profile.edit')->with('success', 'Setup berhasil disimpan.');
        })->name('setup-kandang.save');

        Route::delete('/setup-kandang', function (\Illuminate\Http\Request $request) {
            $user = $request->user();
            $coopCode = $request->query('coop_code');

            \Illuminate\Support\Facades\DB::transaction(function () use ($user, $coopCode) {
                if ($coopCode) {
                    $coop = \App\Models\Coop::whereHas('farm', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    })->where('coop_code', $coopCode)->first();

                    if ($coop) {
                        $farm = $coop->farm;
                        foreach ($coop->cycles as $cycle) {
                            $cycle->dailyRecords()->delete();
                            $cycle->healthRecords()->delete();
                            $cycle->timelineTasks()->delete();
                            $cycle->delete();
                        }
                        $coop->delete();
                        
                        if ($farm && $farm->coops()->count() === 0) {
                            $farm->delete();
                        }
                    }
                } else {
                    $farm = $user->farms()->first();
                    if ($farm) {
                        foreach ($farm->coops as $coop) {
                            foreach ($coop->cycles as $cycle) {
                                $cycle->dailyRecords()->delete();
                                $cycle->healthRecords()->delete();
                                $cycle->timelineTasks()->delete();
                                $cycle->delete();
                            }
                            $coop->delete();
                        }
                        $farm->delete();
                    }
                }
            });
            return redirect()->route('profile.edit')->with('success', 'Kandang berhasil dihapus.');
        })->name('setup-kandang.delete');

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
        Route::patch('/cycles/{cycle}/target', function (\App\Models\Cycle $cycle, \Illuminate\Http\Request $request) {
            $validated = $request->validate([
                'target_days' => 'required|integer|min:1',
            ]);
            $cycle->update([
                'target_days' => $validated['target_days']
            ]);
            return redirect()->back()->with('success', 'Target hari berhasil diperbarui.');
        })->name('cycles.update-target');
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
        Route::put('/cycles/{cycle}/timeline/{task}', [TimelineTaskController::class, 'update'])->name('timeline-tasks.update');
        Route::delete('/cycles/{cycle}/timeline/{task}', [TimelineTaskController::class, 'destroy'])->name('timeline-tasks.destroy');

        // Notifications
        Route::patch('/notifications/{id}/read', [DashboardController::class, 'markNotificationAsRead'])->name('notifications.read');

        // AI Chatbot
        Route::post('/chatbot', [ChatbotController::class, 'chat'])->name('chatbot.chat');
    });
});

require __DIR__.'/auth.php';
