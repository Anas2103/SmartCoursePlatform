<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'thumbnail_url' => $this->thumbnail_url,
            'level' => $this->level,
            'status' => $this->status,
            'price' => $this->price,
            'discount_price' => $this->discount_price,
            'effective_price' => $this->effective_price,
            'language' => $this->language,
            'duration_minutes' => $this->duration_minutes,
            'total_lessons' => $this->total_lessons,
            'total_enrolled' => $this->total_enrolled,
            'avg_rating' => $this->avg_rating,
            'total_reviews' => $this->total_reviews,
            'is_featured' => $this->is_featured,
            'is_bestseller' => $this->is_bestseller,
            'teacher' => $this->whenLoaded('teacher', fn() => [
                'id' => $this->teacher->id,
                'name' => $this->teacher->name,
                'avatar_url' => $this->teacher->avatar_url,
                'headline' => $this->teacher->headline,
            ]),
            'category' => $this->whenLoaded('category', fn() => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'enrollments_count' => $this->whenCounted('enrollments'),
            'reviews_count' => $this->whenCounted('reviews'),
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
        ];
    }
}
