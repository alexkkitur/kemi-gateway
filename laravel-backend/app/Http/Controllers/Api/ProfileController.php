<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function me(Request $r)
    {
        $profile = Profile::firstOrCreate(
            ['user_id' => $r->user()->id],
            ['full_name' => $r->user()->email, 'email' => $r->user()->email]
        );
        return response()->json($profile);
    }

    public function update(Request $r)
    {
        $userId = $r->user()->id;

        $data = $r->validate([
            'full_name'     => ['sometimes', 'string', 'max:120'],
            'phone'         => ['sometimes', 'nullable', 'string', 'max:30'],
            'id_number'     => ['sometimes', 'nullable', 'string', 'max:60'],
            'address'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'date_of_birth' => ['sometimes', 'nullable', 'date'],
            'gender'        => ['sometimes', 'nullable', 'string', 'max:20'],
            'tsc_number'    => ['sometimes', 'nullable', 'string', 'max:60',
                                Rule::unique('profiles', 'tsc_number')->ignore($userId, 'user_id')],
            'delm_number'   => ['sometimes', 'nullable', 'string', 'max:60',
                                Rule::unique('profiles', 'delm_number')->ignore($userId, 'user_id')],
            'designation'   => ['sometimes', 'nullable', 'string', 'max:120'],
            'employer'      => ['sometimes', 'nullable', 'string', 'max:120'],
            'county'        => ['sometimes', 'nullable', 'string', 'max:80'],
            'sub_county'    => ['sometimes', 'nullable', 'string', 'max:80'],
            'school_name'   => ['sometimes', 'nullable', 'string', 'max:150'],
        ]);

        $profile = Profile::where('user_id', $userId)->firstOrFail();
        $profile->update($data);

        // Auto-mark complete when all required fields are present
        if ($profile->isComplete()) {
            $profile->update(['profile_complete' => true]);
        }

        return response()->json($profile->fresh());
    }
}
