<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coop extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'farm_id',
        'coop_code',
        'coop_type',
        'capacity',
        'area_m2',
        'description',
        'is_active',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'area_m2' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function farm()
    {
        return $this->belongsTo(Farm::class);
    }

    public function cycles()
    {
        return $this->hasMany(Cycle::class);
    }
}
