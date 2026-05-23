<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommodityPrice extends Model
{
    use HasFactory;

    protected $table = 'commodity_prices';

    protected $fillable = [
        'commodity',
        'price_usd',
        'price_idr',
        'change_pct_30d',
        'recorded_date',
        'source',
    ];

    protected $casts = [
        'price_usd' => 'decimal:4',
        'price_idr' => 'decimal:2',
        'change_pct_30d' => 'decimal:2',
        'recorded_date' => 'date',
    ];
}
