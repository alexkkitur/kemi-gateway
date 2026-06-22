<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasUuids;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    public function course()    { return $this->belongsTo(Course::class, 'course_id'); }
    public function student()   { return $this->belongsTo(User::class, 'student_id'); }
    public function payments()  { return $this->hasMany(Payment::class, 'application_id'); }
    public function admissionLetter() { return $this->hasOne(AdmissionLetter::class, 'application_id'); }
    public function approvals() { return $this->hasMany(Approval::class, 'application_id'); }
    public function examCard()   { return $this->hasOne(ExamCard::class, 'application_id'); }
}
