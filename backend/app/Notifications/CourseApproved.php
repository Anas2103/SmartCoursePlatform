<?php

namespace App\Notifications;

use App\Models\Course;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CourseApproved extends Notification
{
    use Queueable;

    public function __construct(public Course $course)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'course_approved',
            'title' => 'Course approved',
            'message' => "Your course \"{$this->course->title}\" has been approved and is now live.",
            'course_id' => $this->course->id,
            'course_slug' => $this->course->slug,
        ];
    }
}
