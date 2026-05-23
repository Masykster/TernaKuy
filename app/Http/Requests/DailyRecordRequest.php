<?php

namespace App\Http\Requests;

use App\Models\Cycle;
use App\Models\DailyRecord;
use Illuminate\Foundation\Http\FormRequest;

class DailyRecordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $cycleParam = $this->route('cycle');
        $cycle = $cycleParam instanceof Cycle ? $cycleParam : Cycle::findOrFail($cycleParam);
        
        $prevRecord = DailyRecord::where('cycle_id', $cycle->id)
            ->orderBy('record_date', 'desc')
            ->first();
            
        $currentLivePop = $prevRecord ? $prevRecord->live_population : $cycle->doc_count;

        return [
            'feed_kg' => 'required|numeric|min:0|max:10000',
            'mortality' => 'required|integer|min:0|max:' . $currentLivePop,
            'avg_weight_g' => 'nullable|numeric|min:100|max:5000',
            'condition' => 'nullable|in:good,warning,critical',
            'notes' => 'nullable|string|max:500',
            'record_date' => 'nullable|date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'mortality.max' => 'Jumlah mati melebihi populasi hidup',
        ];
    }
}
