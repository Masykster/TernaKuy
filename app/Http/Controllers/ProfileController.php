<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        
        // Fetch coops from DB
        $coops = \App\Models\Coop::whereHas('farm', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->with('farm')->get()->map(function ($coop) {
            // Find active cycle population
            $activeCycle = $coop->cycles()->where('status', 'active')->first();
            $pop = $activeCycle ? $activeCycle->doc_count : $coop->capacity;
            return [
                'id' => $coop->coop_code,
                'status' => 'AKTIF',
                'population' => $pop . ' EKOR',
                'farmName' => $coop->farm->name,
                'is_db' => true,
            ];
        });

        // Fetch farms with nested coops and cycles
        $farms = $user->farms()->with(['coops.cycles'])->get()->map(function ($farm) {
            return [
                'id' => $farm->id,
                'name' => $farm->name,
                'address' => $farm->address,
                'latitude' => $farm->latitude,
                'longitude' => $farm->longitude,
                'species' => $farm->species,
                'coops' => $farm->coops->map(function ($coop) {
                    $activeCycle = $coop->cycles()->where('status', 'active')->first();
                    $pop = $activeCycle ? $activeCycle->doc_count : $coop->capacity;
                    return [
                        'id' => $coop->coop_code,
                        'status' => 'AKTIF',
                        'population' => $pop . ' EKOR',
                        'is_db' => true,
                    ];
                })->values()->all(),
            ];
        });

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'dbCages' => $coops,
            'dbFarms' => $farms,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
