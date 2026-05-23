<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HarvestRecord extends Model
{
    use HasFactory;

    protected $table = 'harvest_records';

    protected $fillable = [
        'cycle_id',
        'harvest_date',
        'harvest_count',
        'total_weight_kg',
        'avg_weight_kg',
        'price_per_kg',
        'total_revenue',
        'fcr_final',
        'ip_score',
        'mortality_rate',
        'notes',
    ];

    protected $casts = [
        'harvest_date' => 'date',
        'harvest_count' => 'integer',
        'total_weight_kg' => 'float',
        'avg_weight_kg' => 'float',
        'price_per_kg' => 'float',
        'total_revenue' => 'float',
        'fcr_final' => 'float',
        'ip_score' => 'float',
        'mortality_rate' => 'float',
    ];

    /**
     * Get the cycle associated with this harvest record.
     */
    public function cycle()
    {
        return $this->belongsTo(Cycle::class);
    }
}
