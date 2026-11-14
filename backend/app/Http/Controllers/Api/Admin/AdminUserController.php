<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->search) {
            $query->where(fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"));
        }

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->status === 'banned') {
            $query->where('is_banned', true);
        } elseif ($request->status === 'active') {
            $query->where('is_active', true)->where('is_banned', false);
        }

        $users = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['admin', 'teacher', 'student'])],
        ]);

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => new UserResource($user),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        $user->loadCount(['enrollments', 'taughtCourses', 'reviews']);

        return response()->json(new UserResource($user));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => ['sometimes', Rule::in(['admin', 'teacher', 'student'])],
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->role === 'super-admin') {
            return response()->json(['message' => 'Cannot delete super admin.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function ban(Request $request, User $user): JsonResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $user->update([
            'is_banned' => true,
            'ban_reason' => $request->reason,
            'banned_at' => now(),
        ]);

        return response()->json(['message' => 'User banned successfully.']);
    }

    public function unban(User $user): JsonResponse
    {
        $user->update(['is_banned' => false, 'ban_reason' => null, 'banned_at' => null]);

        return response()->json(['message' => 'User unbanned successfully.']);
    }

    public function verify(User $user): JsonResponse
    {
        $user->update(['email_verified_at' => now()]);

        return response()->json(['message' => 'User email verified.']);
    }
}
