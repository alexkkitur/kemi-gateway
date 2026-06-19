<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Certificate;
use App\Models\Profile;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CertificateController extends Controller
{
    private function shape(Certificate $c, array $profileMap = []): array
    {
        $row = $c->toArray();
        $row['course_title']  = optional($c->course ?? null)->title ?? '';
        $p = $profileMap[$c->student_id] ?? null;
        $row['student_name']  = $p['full_name'] ?? '';
        $row['student_email'] = $p['email'] ?? '';
        return $row;
    }

    public function index()
    {
        $certs = Certificate::with('course')->orderByDesc('created_at')->get();
        $profiles = Profile::whereIn('user_id', $certs->pluck('student_id')->unique())->get()
            ->keyBy('user_id')
            ->map(fn ($p) => ['full_name' => $p->full_name, 'email' => $p->email])->all();
        return $certs->map(fn ($c) => $this->shape($c, $profiles));
    }

    public function mine(Request $r)
    {
        $certs = Certificate::with('course')
            ->where('student_id', $r->user()->id)
            ->orderByDesc('created_at')->get();
        return $certs->map(function ($c) {
            $row = $c->toArray();
            $row['course_title'] = optional($c->course)->title ?? '';
            return $row;
        });
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'application_id' => ['required', 'uuid', 'exists:applications,id'],
            'student_id'     => ['required', 'uuid', 'exists:users,id'],
            'course_id'      => ['required', 'uuid', 'exists:courses,id'],
        ]);

        $number = 'KEMI-' . strtoupper(Str::random(6)) . '-' . strtoupper(Str::random(4));
        $cert = Certificate::create([
            ...$data,
            'certificate_number' => $number,
            'status'             => 'ready',
            'issued_date'        => now(),
            'issued_by'          => $r->user()->id,
        ]);

        // PDF
        $cert->load(['course']);
        $cert->student_profile = Profile::where('user_id', $cert->student_id)->first();
        $pdf = Pdf::loadView('pdfs.certificate', ['cert' => $cert]);
        $relative = "certificates/{$cert->id}.pdf";
        Storage::disk('public')->put($relative, $pdf->output());
        $cert->update(['file_url' => Storage::disk('public')->url($relative)]);

        AuditLog::log($r->user()->id, 'certificate_issued', 'certificates', $cert->id, "Certificate #{$number}");

        return response()->json(['data' => $cert->fresh()], 201);
    }

    public function revoke(Request $r, Certificate $certificate)
    {
        $data = $r->validate(['reason' => ['required', 'string']]);
        $certificate->update([
            'status'            => 'revoked',
            'revoked_at'        => now(),
            'revocation_reason' => $data['reason'],
        ]);
        AuditLog::log($r->user()->id, 'certificate_revoked', 'certificates', $certificate->id, $data['reason']);
        return response()->json(['ok' => true]);
    }

    public function download(Request $r, Certificate $certificate)
    {
        $isOwner = $certificate->student_id === $r->user()->id;
        $isStaff = collect(['admin', 'dd_aec', 'dd_cdt', 'super_admin'])
            ->some(fn ($role) => $r->user()->hasRole($role));
        abort_unless($isOwner || $isStaff, 403);
        abort_if($certificate->status === 'revoked', 410, 'Certificate has been revoked');

        $path = str_replace(Storage::disk('public')->url(''), '', $certificate->file_url ?? '');
        abort_if(! $path, 404);
        return Storage::disk('public')->download(ltrim($path, '/'));
    }
}
