<?php

use App\Http\Controllers\Api\AdmissionLetterController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\ExamCardController;
use App\Http\Controllers\Api\FeeController;
use App\Http\Controllers\Api\GraduationController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('signup', [AuthController::class, 'signup']);
    Route::post('login',  [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me',      [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    // Courses
    Route::get('courses', [CourseController::class, 'index']);

    // Profile
    Route::get('profile/me',   [ProfileController::class, 'me']);
    Route::patch('profile/me', [ProfileController::class, 'update']);

    // Applications
    Route::get('applications/me', [ApplicationController::class, 'mine']);
    Route::post('applications',   [ApplicationController::class, 'store']);
    Route::post('applications/{application}/payment-proof', [ApplicationController::class, 'uploadPaymentProof']);

    // Fee catalogue & invoices
    Route::get('fee-items',                                    [FeeController::class, 'items']);
    Route::post('applications/{application}/fee-invoice',      [FeeController::class, 'invoice']);
    Route::get('applications/{application}/fee-invoice',       [FeeController::class, 'show']);

    // Exam cards
    Route::get('applications/{application}/exam-card',         [ExamCardController::class, 'show']);
    Route::post('applications/{application}/exam-card',        [ExamCardController::class, 'request']);
    Route::get('exam-cards/me',                                [ExamCardController::class, 'mine']);
    Route::post('exam-cards/{examCard}/issue',                 [ExamCardController::class, 'issue'])->middleware('role:admission_officer,super_admin');
    Route::get('exam-cards',                                   [ExamCardController::class, 'index'])->middleware('role:admission_officer,dd_aec,dd_cdt,super_admin');

    // Student certificates & documents
    Route::get('certificates/me', [CertificateController::class, 'mine']);

    // Admission letter download
    Route::get('admission-letters/{application}/download', [AdmissionLetterController::class, 'download']);
    Route::get('certificates/{certificate}/download',      [CertificateController::class, 'download']);

    // ===== Admin / Approver / Authorizer / Super Admin =====
    Route::middleware('role:admission_officer,dd_aec,dd_cdt,super_admin')->group(function () {
        Route::get('applications', [ApplicationController::class, 'index']);
        Route::get('audit-logs',   [AuditLogController::class, 'index']);
        Route::get('graduations',  [GraduationController::class, 'index']);
        Route::get('certificates', [CertificateController::class, 'index']);
    });

    Route::middleware('role:admission_officer,super_admin')->group(function () {
        Route::post('applications/{application}/verify-payment',    [ApplicationController::class, 'verifyPayment']);
        Route::post('applications/{application}/complete-training', [ApplicationController::class, 'completeTraining']);
        Route::post('applications/{application}/graduate',          [ApplicationController::class, 'graduate']);
        Route::post('certificates',                                 [CertificateController::class, 'store']);
        Route::post('certificates/{certificate}/revoke',            [CertificateController::class, 'revoke']);
    });

    Route::middleware('role:dd_aec,super_admin')->group(function () {
        Route::post('applications/{application}/approve', [ApplicationController::class, 'approve']);
    });

    Route::middleware('role:dd_cdt,super_admin')->group(function () {
        Route::post('applications/{application}/authorize', [ApplicationController::class, 'authorize']);
    });

    Route::middleware('role:super_admin')->group(function () {
        Route::post('applications/{application}/override-status',  [ApplicationController::class, 'overrideStatus']);
        Route::post('applications/{application}/override-payment', [ApplicationController::class, 'overridePayment']);
    });
});
