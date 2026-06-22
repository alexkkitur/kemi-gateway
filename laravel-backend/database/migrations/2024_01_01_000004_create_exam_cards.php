<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('exam_cards', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('card_number')->unique();
            $t->foreignUuid('application_id')->unique()->constrained('applications')->cascadeOnDelete();
            $t->foreignUuid('student_id')->constrained('users')->cascadeOnDelete();
            $t->foreignUuid('course_id')->constrained('courses')->cascadeOnDelete();
            // JSON array of unit objects: [{code, name, exam_date}]
            $t->json('units');
            $t->integer('units_count')->default(0);
            $t->string('exam_series')->nullable();  // e.g. "April 2026"
            $t->date('exam_start_date')->nullable();
            $t->date('exam_end_date')->nullable();
            // pending | issued | cancelled
            $t->string('status')->default('pending');
            $t->string('file_url')->nullable();
            $t->foreignUuid('issued_by')->nullable()->constrained('users');
            $t->timestamp('issued_at')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_cards');
    }
};
