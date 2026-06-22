<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasUuids;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
        'date_of_birth'    => 'date',
        'profile_complete' => 'boolean',
    ];

    public function isComplete(): bool
    {
        return $this->profile_complete
            || (
                filled($this->full_name)
                && filled($this->phone)
                && filled($this->id_number)
                && (filled($this->tsc_number) || filled($this->delm_number))
                && filled($this->designation)
                && filled($this->county)
            );
    }
}
