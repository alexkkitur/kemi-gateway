<?php

use App\Http\Controllers\Api\AdmissionLetterController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\GraduationController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('signup', [AuthController::class, 'signup']);
    Route::post('login',  [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me',     [AuthController::class, 'me']);
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

    // Student certificates
    Route::get('certificates/me', [CertificateController::class, 'mine']);

    // Admission letter download (student or admin)
    Route::get('admission-letters/{application}/download', [AdmissionLetterController::class, 'download']);
    Route::get('certificates/{certificate}/download',     [CertificateController::class, 'download']);

    // ============= Admin / Approver / Authorizer / Super Admin =============
    Route::middleware('role:admin,dd_aec,dd_cdt,super_admin')->group(function () {
        Route::get('applications', [ApplicationController::class, 'index']);
        Route::get('audit-logs',   [AuditLogController::class, 'index']);
        Route::get('graduations',  [GraduationController::class, 'index']);
        Route::get('certificates', [CertificateController::class, 'index']);
    });

    // Payment verification (admin)
    Route::middleware('role:admin,super_admin')->group(function () {
        Route::post('applications/{application}/verify-payment', [ApplicationController::class, 'verifyPayment']);
    });

    // Approval (DD/AEC)
    Route::middleware('role:dd_aec,super_admin')->group(function () {
        Route::post('applications/{application}/approve', [ApplicationController::class, 'approve']);
    });

    // Authorization (DD/CD&T)
    Route::middleware('role:dd_cdt,super_admin')->group(function () {
        Route::post('applications/{application}/authorize', [ApplicationController::class, 'authorize']);
    });

    // Training lifecycle + certificates (admin)
    Route::middleware('role:admin,super_admin')->group(function () {
        Route::post('applications/{application}/complete-training', [ApplicationController::class, 'completeTraining']);
        Route::post('applications/{application}/graduate',          [ApplicationController::class, 'graduate']);
        Route::post('certificates',                                 [CertificateController::class, 'store']);
        Route::post('certificates/{certificate}/revoke',            [CertificateController::class, 'revoke']);
    });

    // Super admin overrides
    Route::middleware('role:super_admin')->group(function () {
        Route::post('applications/{application}/override-status',  [ApplicationController::class, 'overrideStatus']);
        Route::post('applications/{application}/override-payment', [ApplicationController::class, 'overridePayment']);
    });
});
