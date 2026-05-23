<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $activeCycle = null;
        if ($request->user()) {
            $activeCycle = \App\Models\Cycle::whereHas('coop.farm', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })->where('status', 'active')->first();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'active_cycle_id' => $activeCycle ? $activeCycle->id : null,
            'flash' => [
                'daily_record_saved' => $request->session()->get('daily_record_saved'),
            ],
        ];
    }
}
