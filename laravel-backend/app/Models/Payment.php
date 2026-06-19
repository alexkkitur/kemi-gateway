<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasUuids;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];
    protected $casts = ['amount' => 'decimal:2', 'verification_date' => 'datetime'];
}
