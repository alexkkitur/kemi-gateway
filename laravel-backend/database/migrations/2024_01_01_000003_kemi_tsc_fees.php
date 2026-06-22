<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Extend profiles with KEMI-specific fields
        Schema::table('profiles', function (Blueprint $t) {
            $t->string('tsc_number')->nullable()->unique()->after('email');
            $t->string('delm_number')->nullable()->unique()->after('tsc_number');
            $t->string('designation')->nullable()->after('delm_number');
            $t->string('employer')->nullable()->after('designation');
            $t->string('county')->nullable()->after('employer');
            $t->string('sub_county')->nullable()->after('county');
            $t->string('school_name')->nullable()->after('sub_county');
            $t->boolean('profile_complete')->default(false)->after('school_name');
        });

        // Fee line-items catalogue (transcript fee, exam card fee, unit fees, etc.)
        Schema::create('fee_items', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('name');                   // e.g. "Transcript Fee", "Exam Card", "Unit Fee"
            $t->string('category');               // transcript | exam_card | unit | registration | misc
            $t->decimal('amount', 12, 2);
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        // Per-application fee invoice
        Schema::create('fee_invoices', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('application_id')->constrained('applications')->cascadeOnDelete();
            $t->foreignUuid('student_id')->constrained('users')->cascadeOnDelete();
            $t->json('line_items');    // [{fee_item_id, name, category, amount, qty}]
            $t->decimal('subtotal', 12, 2)->default(0);
            $t->decimal('discount', 12, 2)->default(0);
            $t->decimal('total', 12, 2)->default(0);
            // pending | partial | paid | waived
            $t->string('status')->default('pending');
            $t->integer('units_registered')->default(0);
            $t->boolean('has_transcript')->default(false);
            $t->boolean('has_exam_card')->default(false);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_invoices');
        Schema::dropIfExists('fee_items');
        Schema::table('profiles', function (Blueprint $t) {
            $t->dropColumn([
                'tsc_number','delm_number','designation','employer',
                'county','sub_county','school_name','profile_complete',
            ]);
        });
    }
};
