<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function signup(Request $r)
    {
        $data = $r->validate([
            'email'     => ['required', 'email', 'unique:users,email'],
            'password'  => ['required', 'min:6'],
            'full_name' => ['required', 'string', 'max:120'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
            ]);
            Profile::create([
                'user_id'   => $user->id,
                'full_name' => $data['full_name'],
                'email'     => $data['email'],
            ]);
            UserRole::create(['user_id' => $user->id, 'role' => 'student']);
            return $user;
        });

        return $this->authPayload($user);
    }

    public function login(Request $r)
    {
        $data = $r->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $data['email'])->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        return $this->authPayload($user);
    }

    public function me(Request $r)
    {
        return response()->json($this->shape($r->user()));
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()?->delete();
        return response()->json(['ok' => true]);
    }

    private function authPayload(User $user)
    {
        $token = $user->createToken('web')->plainTextToken;
        return response()->json([
            'token' => $token,
            'user'  => $this->shape($user),
        ]);
    }

    private function shape(User $user): array
    {
        $user->load('profile');
        return [
            'id'    => $user->id,
            'email' => $user->email,
            'name'  => $user->profile->full_name ?? $user->email,
            'role'  => $user->primaryRole() ?? 'student',
        ];
    }
}
