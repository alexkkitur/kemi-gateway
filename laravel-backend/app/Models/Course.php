<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasUuids;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];
    protected $casts = ['is_active' => 'boolean', 'fee' => 'decimal:2'];
}
