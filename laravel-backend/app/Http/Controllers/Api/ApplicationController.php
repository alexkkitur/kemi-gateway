<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdmissionLetter;
use App\Models\Application;
use App\Models\Approval;
use App\Models\AuditLog;
use App\Models\Graduation;
use App\Models\Payment;
use App\Models\Profile;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    /** Shape rows for the React frontend, including joined fields. */
    private function shape($app, ?array $profileMap = null, ?array $letterMap = null): array
    {
        $row = $app->toArray();
        $row['course_title']    = optional($app->course)->title ?? '';
        $row['course_duration'] = optional($app->course)->duration ?? '';
        if ($profileMap !== null) {
            $p = $profileMap[$app->student_id] ?? null;
            $row['student_name']  = $p['full_name'] ?? 'Unknown';
            $row['student_email'] = $p['email'] ?? '';
        }
        $row['admission_letter_url'] = $letterMap[$app->id]
            ?? optional($app->admissionLetter)->file_url;
        return $row;
    }

    public function mine(Request $r)
    {
        $apps = Application::with(['course', 'admissionLetter'])
            ->where('student_id', $r->user()->id)
            ->orderByDesc('created_at')->get();

        return $apps->map(fn ($a) => $this->shape($a));
    }

    public function index()
    {
        $apps = Application::with(['course', 'admissionLetter'])->orderByDesc('created_at')->get();
        $ids = $apps->pluck('student_id')->unique()->all();
        $profiles = Profile::whereIn('user_id', $ids)->get()
            ->keyBy('user_id')
            ->map(fn ($p) => ['full_name' => $p->full_name, 'email' => $p->email])
            ->all();

        return $apps->map(fn ($a) => $this->shape($a, $profiles));
    }

    public function store(Request $r)
    {
        $data = $r->validate(['course_id' => ['required', 'uuid', 'exists:courses,id']]);

        $app = Application::create([
            'student_id'     => $r->user()->id,
            'course_id'      => $data['course_id'],
            'status'         => 'pending_verification',
            'payment_status' => 'not_submitted',
        ]);

        return response()->json(['data' => $app], 201);
    }

    public function uploadPaymentProof(Request $r, Application $application)
    {
        abort_unless($application->student_id === $r->user()->id, 403);

        $r->validate([
            'file'             => ['required_without:reference_number', 'file', 'max:5120'],
            'reference_number' => ['nullable', 'string', 'max:120'],
            'amount'           => ['nullable', 'numeric'],
        ]);

        $url = null;
        if ($r->hasFile('file')) {
            $path = $r->file('file')->store(
                "payment-proofs/{$r->user()->id}/{$application->id}",
                'public'
            );
            $url = Storage::disk('public')->url($path);
        }

        Payment::create([
            'application_id'   => $application->id,
            'student_id'       => $r->user()->id,
            'amount'           => $r->input('amount'),
            'reference_number' => $r->input('reference_number'),
            'proof_file_url'   => $url,
            'status'           => 'submitted',
        ]);

        $application->update(['payment_status' => 'submitted']);

        return response()->json(['ok' => true, 'file_url' => $url]);
    }

    public function verifyPayment(Request $r, Application $application)
    {
        $data = $r->validate([
            'verified' => ['required', 'boolean'],
            'reason'   => ['nullable', 'string'],
        ]);
        $newStatus = $data['verified'] ? 'verified' : 'rejected';

        Payment::where('application_id', $application->id)
            ->update([
                'status'            => $newStatus,
                'verified_by'       => $r->user()->id,
                'verification_date' => now(),
            ]);

        $application->update([
            'payment_status' => $newStatus,
            'status'         => $data['verified'] ? 'enrolled' : 'rejected',
        ]);

        AuditLog::log(
            $r->user()->id,
            $data['verified'] ? 'payment_verified' : 'payment_rejected',
            'applications', $application->id, $data['reason'] ?? null
        );

        return response()->json(['ok' => true]);
    }

    public function approve(Request $r, Application $application)
    {
        $data = $r->validate([
            'approved' => ['required', 'boolean'],
            'comment'  => ['nullable', 'string'],
        ]);

        Approval::create([
            'application_id' => $application->id,
            'approver_id'    => $r->user()->id,
            'approver_role'  => 'dd_aec',
            'status'         => $data['approved'] ? 'approved' : 'rejected',
            'comment'        => $data['comment'] ?? null,
        ]);

        $application->update(['status' => $data['approved'] ? 'approved' : 'rejected']);

        if ($data['approved']) {
            $this->generateAdmissionLetter($application);
        }

        AuditLog::log(
            $r->user()->id,
            $data['approved'] ? 'application_approved' : 'application_rejected',
            'applications', $application->id, $data['comment'] ?? null
        );

        return response()->json(['ok' => true]);
    }

    public function authorize(Request $r, Application $application)
    {
        $data = $r->validate(['comment' => ['nullable', 'string']]);

        Approval::create([
            'application_id' => $application->id,
            'approver_id'    => $r->user()->id,
            'approver_role'  => 'dd_cdt',
            'status'         => 'approved',
            'comment'        => $data['comment'] ?? null,
        ]);

        $application->update(['status' => 'authorized']);

        AuditLog::log($r->user()->id, 'training_authorized', 'applications', $application->id, $data['comment'] ?? null);

        return response()->json(['ok' => true]);
    }

    public function completeTraining(Request $r, Application $application)
    {
        $application->update(['status' => 'training_completed']);

        Graduation::firstOrCreate(
            ['application_id' => $application->id],
            [
                'student_id'        => $application->student_id,
                'course_id'         => $application->course_id,
                'completion_status' => 'training_completed',
            ]
        );

        AuditLog::log($r->user()->id, 'training_completed', 'applications', $application->id);

        return response()->json(['ok' => true]);
    }

    public function graduate(Request $r, Application $application)
    {
        $application->update(['status' => 'graduated']);
        Graduation::where('application_id', $application->id)
            ->update(['completion_status' => 'graduated', 'graduation_date' => now()->toDateString()]);

        AuditLog::log($r->user()->id, 'graduated', 'applications', $application->id);

        return response()->json(['ok' => true]);
    }

    public function overrideStatus(Request $r, Application $application)
    {
        $data = $r->validate([
            'status' => ['required', 'string'],
            'reason' => ['required', 'string'],
        ]);
        $application->update(['status' => $data['status']]);
        AuditLog::log($r->user()->id, "override_status_to_{$data['status']}", 'applications', $application->id, $data['reason']);
        return response()->json(['ok' => true]);
    }

    public function overridePayment(Request $r, Application $application)
    {
        $data = $r->validate([
            'status' => ['required', 'string'],
            'reason' => ['required', 'string'],
        ]);

        Payment::where('application_id', $application->id)->update([
            'status'            => $data['status'],
            'verified_by'       => $r->user()->id,
            'verification_date' => now(),
        ]);
        $application->update(['payment_status' => $data['status']]);

        AuditLog::log($r->user()->id, "override_payment_to_{$data['status']}", 'applications', $application->id, $data['reason']);
        return response()->json(['ok' => true]);
    }

    /** Build a branded PDF admission letter and store it. */
    protected function generateAdmissionLetter(Application $app): void
    {
        $app->load(['course', 'student.profile']);
        $pdf = Pdf::loadView('pdfs.admission-letter', ['app' => $app]);
        $relative = "admission-letters/{$app->id}.pdf";
        Storage::disk('public')->put($relative, $pdf->output());
        $url = Storage::disk('public')->url($relative);

        AdmissionLetter::updateOrCreate(
            ['application_id' => $app->id],
            ['file_url' => $url]
        );
    }
}
