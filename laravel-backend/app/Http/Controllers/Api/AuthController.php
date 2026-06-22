<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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

    /**
     * Login accepts: email OR tsc_number OR delm_number + password.
     */
    public function login(Request $r)
    {
        $r->validate([
            'identifier' => ['required', 'string'],
            'password'   => ['required'],
        ]);

        $identifier = trim($r->input('identifier'));
        $user = null;

        // Try email first
        if (str_contains($identifier, '@')) {
            $user = User::where('email', $identifier)->first();
        }

        // Try TSC number via profile
        if (! $user) {
            $profile = Profile::where('tsc_number', $identifier)->first();
            if ($profile) $user = User::find($profile->user_id);
        }

        // Try DELM number via profile
        if (! $user) {
            $profile = Profile::where('delm_number', $identifier)->first();
            if ($profile) $user = User::find($profile->user_id);
        }

        if (! $user || ! Hash::check($r->input('password'), $user->password)) {
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
        $profile = $user->profile;
        return [
            'id'               => $user->id,
            'email'            => $user->email,
            'name'             => $profile->full_name ?? $user->email,
            'role'             => $user->primaryRole() ?? 'student',
            'profile_complete' => $profile ? $profile->isComplete() : false,
            'tsc_number'       => $profile->tsc_number ?? null,
            'delm_number'      => $profile->delm_number ?? null,
        ];
    }
}
