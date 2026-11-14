<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lesson_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('body');
            $table->boolean('is_pinned')->default(false);
            $table->unsignedInteger('upvotes')->default(0);
            $table->timestamps();
            $table->index(['lesson_id', 'created_at']);
        });

        Schema::create('lesson_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('lesson_questions')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('body');
            $table->boolean('is_accepted')->default(false);
            $table->unsignedInteger('upvotes')->default(0);
            $table->timestamps();
        });

        Schema::create('question_upvotes', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('voteable');
            $table->primary(['user_id', 'voteable_type', 'voteable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_upvotes');
        Schema::dropIfExists('lesson_answers');
        Schema::dropIfExists('lesson_questions');
    }
};
