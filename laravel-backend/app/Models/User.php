<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasUuids, Notifiable;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['email', 'password'];
    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function profile()       { return $this->hasOne(Profile::class, 'user_id'); }
    public function userRoles()     { return $this->hasMany(UserRole::class, 'user_id'); }
    public function applications()  { return $this->hasMany(Application::class, 'student_id'); }

    public function hasRole(string $role): bool
    {
        return $this->userRoles()->where('role', $role)->exists();
    }

    public function primaryRole(): ?string
    {
        return optional($this->userRoles()->first())->role;
    }
}
