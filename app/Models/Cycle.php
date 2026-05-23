<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cycle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'coop_id',
        'doc_date',
        'doc_count',
        'strain',
        'supplier_doc',
        'price_doc',
        'target_days',
        'status',
        'notes',
        'closed_at',
    ];

    protected $casts = [
        'coop_id' => 'integer',
        'doc_count' => 'integer',
        'price_doc' => 'decimal:2',
        'target_days' => 'integer',
        'closed_at' => 'datetime',
    ];

    public function coop()
    {
        return $this->belongsTo(Coop::class);
    }

    public function timelineTasks()
    {
        return $this->hasMany(TimelineTask::class);
    }

    public function dailyRecords()
    {
        return $this->hasMany(DailyRecord::class);
    }

    public function healthRecords()
    {
        return $this->hasMany(HealthRecord::class);
    }

    public function harvestRecord()
    {
        return $this->hasOne(HarvestRecord::class);
    }
}
