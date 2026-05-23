<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TimelineTask extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cycle_id',
        'task_date',
        'day_number',
        'task_name',
        'category',
        'is_system',
        'is_done',
        'done_at',
        'notify',
        'notes',
    ];

    protected $casts = [
        'cycle_id' => 'integer',
        'day_number' => 'integer',
        'is_system' => 'boolean',
        'is_done' => 'boolean',
        'done_at' => 'datetime',
        'notify' => 'boolean',
    ];

    public function cycle()
    {
        return $this->belongsTo(Cycle::class);
    }
}
