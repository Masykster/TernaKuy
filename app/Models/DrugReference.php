<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DrugReference extends Model
{
    use HasFactory;

    protected $table = 'drugs_reference';

    protected $fillable = [
        'drug_name',
        'category',
        'withdrawal_days',
        'description',
        'is_active',
    ];

    protected $casts = [
        'withdrawal_days' => 'integer',
        'is_active' => 'boolean',
    ];
}
