<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ExamCard extends Model
{
    use HasUuids;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
        'units'          => 'array',
        'units_count'    => 'integer',
        'exam_start_date'=> 'date',
        'exam_end_date'  => 'date',
        'issued_at'      => 'datetime',
    ];

    public function application() { return $this->belongsTo(Application::class); }
    public function student()     { return $this->belongsTo(User::class, 'student_id'); }
    public function course()      { return $this->belongsTo(Course::class); }
}
