<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HealthRecord extends Model
{
    use HasFactory;

    protected $table = 'health_records';

    protected $fillable = [
        'cycle_id',
        'record_date',
        'record_type',
        'drug_name',
        'dosage',
        'method',
        'withdrawal_days',
        'withdrawal_end',
        'notes',
    ];

    protected $casts = [
        'record_date' => 'date',
        'withdrawal_end' => 'date',
        'withdrawal_days' => 'integer',
    ];

    public function cycle()
    {
        return $this->belongsTo(Cycle::class);
    }
}
