<?php

namespace App\Http\Controllers;

use App\Models\Farm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class FarmController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $farms = Auth::user()->farms;
        return Inertia::render('Farm/Index', [
            'farms' => $farms
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'species' => 'required|in:broiler',
            'is_active' => 'boolean',
        ]);

        Auth::user()->farms()->create($validated);

        return redirect()->back()->with('success', 'Farm created successfully');
    }

    public function show(Farm $farm)
    {
        $this->authorize('view', $farm);
        $farm->load('coops');
        return Inertia::render('Farm/Show', [
            'farm' => $farm
        ]);
    }

    public function update(Request $request, Farm $farm)
    {
        $this->authorize('update', $farm);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'species' => 'required|in:broiler',
            'is_active' => 'boolean',
        ]);

        $farm->update($validated);

        return redirect()->back()->with('success', 'Farm updated successfully');
    }

    public function destroy(Farm $farm)
    {
        $this->authorize('delete', $farm);
        $farm->delete();
        return redirect()->route('dashboard')->with('success', 'Farm deleted successfully');
    }
}
