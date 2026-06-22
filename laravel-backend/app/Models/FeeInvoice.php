<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FeeInvoice extends Model
{
    use HasUuids;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
        'line_items'       => 'array',
        'subtotal'         => 'decimal:2',
        'discount'         => 'decimal:2',
        'total'            => 'decimal:2',
        'units_registered' => 'integer',
        'has_transcript'   => 'boolean',
        'has_exam_card'    => 'boolean',
    ];

    public function application() { return $this->belongsTo(Application::class); }
    public function student()     { return $this->belongsTo(User::class, 'student_id'); }
}
