<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $t->string('full_name');
            $t->string('email');
            $t->string('phone')->nullable();
            $t->string('id_number')->nullable();
            $t->string('address')->nullable();
            $t->date('date_of_birth')->nullable();
            $t->string('gender')->nullable();
            $t->timestamps();
        });

        Schema::create('user_roles', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            // student | admin | dd_aec | dd_cdt | super_admin
            $t->string('role');
            $t->timestamps();
            $t->unique(['user_id', 'role']);
        });

        Schema::create('courses', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('title');
            $t->string('code')->nullable();
            $t->text('description')->nullable();
            $t->string('duration')->nullable();
            $t->string('level')->nullable();
            $t->string('category')->nullable();
            $t->integer('capacity')->nullable();
            $t->decimal('fee', 12, 2)->default(0);
            $t->date('start_date')->nullable();
            $t->date('end_date')->nullable();
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        Schema::create('applications', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('student_id')->constrained('users')->cascadeOnDelete();
            $t->foreignUuid('course_id')->constrained('courses')->cascadeOnDelete();
            // pending_verification | enrolled | approved | authorized | rejected | training_completed | graduated
            $t->string('status')->default('pending_verification');
            // not_submitted | submitted | verified | rejected
            $t->string('payment_status')->default('not_submitted');
            $t->text('notes')->nullable();
            $t->timestamps();
        });

        Schema::create('payments', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('application_id')->constrained('applications')->cascadeOnDelete();
            $t->foreignUuid('student_id')->constrained('users')->cascadeOnDelete();
            $t->decimal('amount', 12, 2)->nullable();
            $t->string('reference_number')->nullable();
            $t->string('proof_file_url')->nullable();
            // submitted | verified | rejected
            $t->string('status')->default('submitted');
            $t->foreignUuid('verified_by')->nullable()->constrained('users');
            $t->timestamp('verification_date')->nullable();
            $t->timestamps();
        });

        Schema::create('approvals', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('application_id')->constrained('applications')->cascadeOnDelete();
            $t->foreignUuid('approver_id')->constrained('users');
            // dd_aec | dd_cdt
            $t->string('approver_role');
            // approved | rejected
            $t->string('status');
            $t->text('comment')->nullable();
            $t->timestamps();
        });

        Schema::create('admission_letters', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('application_id')->unique()->constrained('applications')->cascadeOnDelete();
            $t->string('file_url');
            $t->timestamps();
        });

        Schema::create('graduations', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('application_id')->unique()->constrained('applications')->cascadeOnDelete();
            $t->foreignUuid('student_id')->constrained('users')->cascadeOnDelete();
            $t->foreignUuid('course_id')->constrained('courses')->cascadeOnDelete();
            // training_completed | graduated
            $t->string('completion_status')->default('training_completed');
            $t->date('graduation_date')->nullable();
            $t->text('remarks')->nullable();
            $t->timestamps();
        });

        Schema::create('certificates', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('certificate_number')->unique();
            $t->foreignUuid('student_id')->constrained('users')->cascadeOnDelete();
            $t->foreignUuid('course_id')->constrained('courses')->cascadeOnDelete();
            $t->foreignUuid('application_id')->constrained('applications')->cascadeOnDelete();
            // ready | revoked
            $t->string('status')->default('ready');
            $t->string('file_url')->nullable();
            $t->timestamp('issued_date')->nullable();
            $t->timestamp('revoked_at')->nullable();
            $t->text('revocation_reason')->nullable();
            $t->foreignUuid('issued_by')->nullable()->constrained('users');
            $t->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('admin_id')->constrained('users');
            $t->string('action_type');
            $t->string('target_table');
            $t->uuid('target_record_id')->nullable();
            $t->text('reason')->nullable();
            $t->json('metadata')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('graduations');
        Schema::dropIfExists('admission_letters');
        Schema::dropIfExists('approvals');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('applications');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('profiles');
    }
};
