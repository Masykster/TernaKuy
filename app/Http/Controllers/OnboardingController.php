<?php

namespace App\Http\Controllers;

use App\Models\Farm;
use App\Models\Coop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    /**
     * Display the onboarding setup view.
     */
    public function show()
    {
        if (Auth::user()->farms()->exists()) {
            return redirect()->route('dashboard');
        }
        return Inertia::render('Onboarding/FarmSetup');
    }

    /**
     * Store onboarding farm & coop details.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'farm_name' => 'required|string|max:100',
            'farm_address' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'coop_code' => 'required|string|max:20',
            'coop_type' => 'required|in:open_house,close_house',
            'capacity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated) {
            $farm = Farm::create([
                'user_id' => Auth::id(),
                'name' => $validated['farm_name'],
                'address' => $validated['farm_address'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'species' => 'broiler',
                'is_active' => true,
            ]);

            Coop::create([
                'farm_id' => $farm->id,
                'coop_code' => $validated['coop_code'],
                'coop_type' => $validated['coop_type'],
                'capacity' => $validated['capacity'],
                'area_m2' => null,
                'description' => null,
                'is_active' => true,
            ]);
        });

        return redirect()->route('cycle.create');
    }
}
