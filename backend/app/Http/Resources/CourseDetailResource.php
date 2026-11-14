<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'thumbnail_url' => $this->thumbnail_url,
            'intro_video' => $this->intro_video ? asset('storage/' . $this->intro_video) : null,
            'level' => $this->level,
            'status' => $this->status,
            'price' => $this->price,
            'discount_price' => $this->discount_price,
            'effective_price' => $this->effective_price,
            'discount_ends_at' => $this->discount_ends_at,
            'language' => $this->language,
            'requirements' => $this->requirements ?? [],
            'learning_outcomes' => $this->learning_outcomes ?? [],
            'target_audience' => $this->target_audience ?? [],
            'duration_minutes' => $this->duration_minutes,
            'total_lessons' => $this->total_lessons,
            'total_enrolled' => $this->total_enrolled,
            'avg_rating' => $this->avg_rating,
            'total_reviews' => $this->total_reviews,
            'is_featured' => $this->is_featured,
            'is_bestseller' => $this->is_bestseller,
            'certificate_enabled' => $this->certificate_enabled,
            'teacher' => $this->whenLoaded('teacher', fn() => [
                'id' => $this->teacher->id,
                'name' => $this->teacher->name,
                'avatar_url' => $this->teacher->avatar_url,
                'bio' => $this->teacher->bio,
                'headline' => $this->teacher->headline,
                'courses_count' => $this->teacher->taughtCourses()->count(),
                'students_count' => $this->teacher->taughtCourses()->sum('total_enrolled'),
            ]),
            'category' => $this->whenLoaded('category', fn() => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'sections' => $this->whenLoaded('sections', fn() =>
                $this->sections->map(fn($section) => [
                    'id' => $section->id,
                    'title' => $section->title,
                    'description' => $section->description,
                    'order' => $section->order,
                    'lessons' => $section->lessons->map(fn($lesson) => [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'type' => $lesson->type,
                        'duration_minutes' => $lesson->duration_minutes,
                        'is_free_preview' => $lesson->is_free_preview,
                        'is_published' => $lesson->is_published,
                        'order' => $lesson->order,
                        'video_url' => $lesson->is_free_preview && $lesson->video_url
                            ? asset('storage/' . $lesson->video_url)
                            : null,
                    ]),
                ])
            ),
            'tags' => $this->whenLoaded('tags', fn() =>
                $this->tags->map(fn($tag) => ['id' => $tag->id, 'name' => $tag->name, 'slug' => $tag->slug])
            ),
            'faqs' => $this->whenLoaded('faqs', fn() =>
                $this->faqs->map(fn($faq) => ['id' => $faq->id, 'question' => $faq->question, 'answer' => $faq->answer])
            ),
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
        ];
    }
}
