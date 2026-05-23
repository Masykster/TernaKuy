<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeatherCache extends Model
{
    use HasFactory;

    protected $table = 'weather_cache';

    protected $fillable = [
        'farm_id',
        'temperature_c',
        'humidity_pct',
        'weather_desc',
        'wind_speed',
        'alert_level',
        'alert_message',
        'fetched_at',
    ];

    protected $casts = [
        'temperature_c' => 'decimal:2',
        'humidity_pct' => 'integer',
        'wind_speed' => 'decimal:2',
        'fetched_at' => 'datetime',
    ];

    public function farm()
    {
        return $this->belongsTo(Farm::class);
    }
}
