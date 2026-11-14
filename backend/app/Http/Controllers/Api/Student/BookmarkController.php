<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Bookmark;
use Illuminate\Http\JsonResponse;

class BookmarkController extends Controller
{
    public function index(): JsonResponse
    {
        $bookmarks = Bookmark::where('user_id', auth()->id())
            ->with(['lesson:id,title,section_id,course_id,type,duration_minutes', 'lesson.section:id,title', 'lesson.course:id,title,slug'])
            ->latest()
            ->get();

        return response()->json($bookmarks);
    }

    public function toggle(int $lessonId): JsonResponse
    {
        $bookmark = Bookmark::where('user_id', auth()->id())
            ->where('lesson_id', $lessonId)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            return response()->json(['message' => 'Bookmark removed.', 'is_bookmarked' => false]);
        }

        Bookmark::create(['user_id' => auth()->id(), 'lesson_id' => $lessonId]);

        return response()->json(['message' => 'Lesson bookmarked.', 'is_bookmarked' => true]);
    }
}
