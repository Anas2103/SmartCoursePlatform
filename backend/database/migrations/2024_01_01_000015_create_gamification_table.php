<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('color')->default('#6366f1');
            $table->enum('condition_type', ['courses_completed', 'lessons_completed', 'quizzes_passed', 'streak_days', 'xp_earned', 'first_review', 'first_enrollment', 'certificates_earned']);
            $table->unsignedInteger('condition_value')->default(1);
            $table->unsignedInteger('xp_reward')->default(50);
            $table->timestamps();
        });

        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('badge_id')->constrained()->onDelete('cascade');
            $table->timestamp('earned_at');
            $table->unique(['user_id', 'badge_id']);
        });

        Schema::create('user_xp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('total_xp')->default(0);
            $table->unsignedInteger('weekly_xp')->default(0);
            $table->unsignedInteger('monthly_xp')->default(0);
            $table->unsignedInteger('streak_days')->default(0);
            $table->date('last_activity_date')->nullable();
            $table->timestamps();
            $table->unique('user_id');
        });

        Schema::create('xp_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('amount');
            $table->string('reason');
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('xp_transactions');
        Schema::dropIfExists('user_xp');
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
    }
};
