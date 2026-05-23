<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HealthRecordRequest extends FormRequest
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
        return [
            'record_date' => 'required|date',
            'record_type' => 'required|in:vaccination,treatment,observation',
            'drug_name' => 'required|string|max:100',
            'dosage' => 'nullable|string|max:50',
            'method' => 'nullable|in:drinking_water,eye_drop,injection,feed,spray',
            'withdrawal_days' => 'required_if:record_type,treatment|integer|min:0',
            'notes' => 'nullable|string',
        ];
    }
}
