<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ExamCard;
use App\Models\Profile;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExamCardController extends Controller
{
    /** Student: get their exam card for an application (or null) */
    public function show(Request $r, Application $application)
    {
        abort_unless($application->student_id === $r->user()->id, 403);
        $card = ExamCard::where('application_id', $application->id)->first();
        return response()->json($card);
    }

    /**
     * Student: request an exam card.
     * Only allowed when payment_status = verified AND status = enrolled|approved|authorized.
     *
     * Body: { units: [{code, name, exam_date}], exam_series, exam_start_date, exam_end_date }
     */
    public function request(Request $r, Application $application)
    {
        abort_unless($application->student_id === $r->user()->id, 403);

        // Must have verified payment
        abort_if(
            $application->payment_status !== 'verified',
            422,
            'Exam card can only be requested after payment is verified.'
        );

        // Must be in an active status
        abort_if(
            in_array($application->status, ['pending_verification', 'rejected', 'graduated']),
            422,
            'Your application is not eligible for an exam card at this stage.'
        );

        $data = $r->validate([
            'units'                  => ['required', 'array', 'min:1', 'max:20'],
            'units.*.code'           => ['required', 'string', 'max:20'],
            'units.*.name'           => ['required', 'string', 'max:120'],
            'units.*.exam_date'      => ['nullable', 'date'],
            'exam_series'            => ['nullable', 'string', 'max:60'],
            'exam_start_date'        => ['nullable', 'date'],
            'exam_end_date'          => ['nullable', 'date'],
        ]);

        // Upsert — student can update until it's issued
        $existing = ExamCard::where('application_id', $application->id)->first();
        if ($existing && $existing->status === 'issued') {
            return response()->json(['message' => 'Exam card already issued and cannot be changed.'], 422);
        }

        $cardNumber = $existing?->card_number ?? 'EC-' . strtoupper(Str::random(4)) . '-' . date('Y');

        $card = ExamCard::updateOrCreate(
            ['application_id' => $application->id],
            [
                'card_number'     => $cardNumber,
                'student_id'      => $application->student_id,
                'course_id'       => $application->course_id,
                'units'           => $data['units'],
                'units_count'     => count($data['units']),
                'exam_series'     => $data['exam_series'] ?? null,
                'exam_start_date' => $data['exam_start_date'] ?? null,
                'exam_end_date'   => $data['exam_end_date'] ?? null,
                'status'          => 'pending',
            ]
        );

        return response()->json($card->fresh(), 201);
    }

    /**
     * Admin: issue the exam card (generates PDF).
     */
    public function issue(Request $r, ExamCard $examCard)
    {
        abort_if($examCard->status === 'issued', 422, 'Already issued.');

        $examCard->load(['application.student.profile', 'course']);
        $profile = Profile::where('user_id', $examCard->student_id)->first();

        $pdf = Pdf::loadView('pdfs.exam-card', [
            'card'    => $examCard,
            'profile' => $profile,
        ])->setPaper('a5', 'landscape');

        $relative = "exam-cards/{$examCard->id}.pdf";
        Storage::disk('public')->put($relative, $pdf->output());
        $url = Storage::disk('public')->url($relative);

        $examCard->update([
            'status'    => 'issued',
            'file_url'  => $url,
            'issued_by' => $r->user()->id,
            'issued_at' => now(),
        ]);

        return response()->json($examCard->fresh());
    }

    /** Student mine — all exam cards */
    public function mine(Request $r)
    {
        $cards = ExamCard::with('course')
            ->where('student_id', $r->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($c) {
                $row = $c->toArray();
                $row['course_title'] = optional($c->course)->title ?? '';
                return $row;
            });
        return response()->json($cards);
    }

    /** Admin: list all pending/issued exam cards */
    public function index()
    {
        $cards = ExamCard::with('course')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($c) {
                $row = $c->toArray();
                $row['course_title'] = optional($c->course)->title ?? '';
                $profile = Profile::where('user_id', $c->student_id)->first();
                $row['student_name'] = $profile?->full_name ?? '';
                return $row;
            });
        return response()->json($cards);
    }
}
