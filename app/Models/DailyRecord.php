<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'cycle_id',
        'record_date',
        'day_number',
        'feed_kg',
        'mortality',
        'avg_weight_g',
        'live_population',
        'cum_feed_kg',
        'cum_mortality',
        'fcr_current',
        'mortality_rate',
        'condition',
        'notes',
    ];

    protected $casts = [
        'record_date' => 'date',
        'day_number' => 'integer',
        'feed_kg' => 'decimal:2',
        'mortality' => 'integer',
        'avg_weight_g' => 'decimal:2',
        'live_population' => 'integer',
        'cum_feed_kg' => 'decimal:2',
        'cum_mortality' => 'integer',
        'fcr_current' => 'decimal:3',
        'mortality_rate' => 'decimal:2',
    ];

    public function cycle()
    {
        return $this->belongsTo(Cycle::class);
    }
}
