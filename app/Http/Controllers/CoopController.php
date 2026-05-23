<?php

namespace App\Http\Controllers;

use App\Models\Farm;
use App\Models\Coop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CoopController extends Controller
{
    use AuthorizesRequests;

    public function index(Farm $farm)
    {
        $this->authorize('view', $farm);
        $coops = $farm->coops;
        return Inertia::render('Coop/Index', [
            'farm' => $farm,
            'coops' => $coops
        ]);
    }

    public function store(Request $request, Farm $farm)
    {
        $this->authorize('update', $farm);

        $validated = $request->validate([
            'coop_code' => 'required|string|max:20',
            'coop_type' => 'required|in:open_house,close_house',
            'capacity' => 'required|integer|min:1',
            'area_m2' => 'nullable|numeric|min:0.01',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $exists = Coop::where('farm_id', $farm->id)
            ->where('coop_code', $validated['coop_code'])
            ->exists();
        if ($exists) {
            return redirect()->back()->withErrors([
                'coop_code' => 'Kode kandang ini sudah digunakan di peternakan ini.'
            ]);
        }

        $farm->coops()->create($validated);

        return redirect()->back()->with('success', 'Coop created successfully');
    }

    public function update(Request $request, Farm $farm, Coop $coop)
    {
        $this->authorize('update', $farm);

        $validated = $request->validate([
            'coop_code' => 'required|string|max:20',
            'coop_type' => 'required|in:open_house,close_house',
            'capacity' => 'required|integer|min:1',
            'area_m2' => 'nullable|numeric|min:0.01',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $exists = Coop::where('farm_id', $farm->id)
            ->where('coop_code', $validated['coop_code'])
            ->where('id', '!=', $coop->id)
            ->exists();
        if ($exists) {
            return redirect()->back()->withErrors([
                'coop_code' => 'Kode kandang ini sudah digunakan di peternakan ini.'
            ]);
        }

        $coop->update($validated);

        return redirect()->back()->with('success', 'Coop updated successfully');
    }

    public function destroy(Farm $farm, Coop $coop)
    {
        $this->authorize('update', $farm);
        $coop->delete();
        return redirect()->back()->with('success', 'Coop deleted successfully');
    }
}
