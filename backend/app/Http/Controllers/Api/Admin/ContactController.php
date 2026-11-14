<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        $contact = Contact::create($validated);

        return response()->json(['message' => 'Message sent successfully.'], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Contact::query();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $contacts = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($contacts);
    }

    public function update(Request $request, Contact $contact): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:new,read,replied,closed',
            'reply' => 'nullable|string|max:2000',
        ]);

        if (isset($validated['reply'])) {
            $validated['replied_at'] = now();
        }

        $contact->update($validated);

        return response()->json(['message' => 'Contact updated.', 'contact' => $contact->fresh()]);
    }
}
