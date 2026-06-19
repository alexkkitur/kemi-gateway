<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function me(Request $r)
    {
        return Profile::firstOrCreate(
            ['user_id' => $r->user()->id],
            ['full_name' => $r->user()->email, 'email' => $r->user()->email]
        );
    }

    public function update(Request $r)
    {
        $data = $r->validate([
            'full_name'     => ['sometimes', 'string', 'max:120'],
            'phone'         => ['sometimes', 'nullable', 'string', 'max:30'],
            'id_number'     => ['sometimes', 'nullable', 'string', 'max:60'],
            'address'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'date_of_birth' => ['sometimes', 'nullable', 'date'],
            'gender'        => ['sometimes', 'nullable', 'string', 'max:20'],
        ]);

        $profile = Profile::where('user_id', $r->user()->id)->firstOrFail();
        $profile->update($data);
        return $profile->fresh();
    }
}
