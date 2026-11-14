<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(): JsonResponse
    {
        $announcements = Announcement::where('teacher_id', auth()->id())
            ->with('course:id,title')
            ->latest()
            ->paginate(15);

        return response()->json($announcements);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $validated['teacher_id'] = auth()->id();
        $announcement = Announcement::create($validated);

        return response()->json(['message' => 'Announcement created.', 'announcement' => $announcement], 201);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        return response()->json($announcement);
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        abort_if($announcement->teacher_id !== auth()->id(), 403);
        $announcement->update($request->validate(['title' => 'required|string', 'content' => 'required|string']));

        return response()->json(['message' => 'Announcement updated.', 'announcement' => $announcement->fresh()]);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        abort_if($announcement->teacher_id !== auth()->id(), 403);
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted.']);
    }
}
