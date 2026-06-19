<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdmissionLetter;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdmissionLetterController extends Controller
{
    public function download(Request $r, Application $application)
    {
        $isOwner = $application->student_id === $r->user()->id;
        $isStaff = collect(['admin', 'dd_aec', 'dd_cdt', 'super_admin'])
            ->some(fn ($role) => $r->user()->hasRole($role));
        abort_unless($isOwner || $isStaff, 403);

        $letter = AdmissionLetter::where('application_id', $application->id)->firstOrFail();
        $path = str_replace(Storage::disk('public')->url(''), '', $letter->file_url);
        return Storage::disk('public')->download(ltrim($path, '/'));
    }
}
