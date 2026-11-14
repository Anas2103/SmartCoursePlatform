<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class CertificateController extends Controller
{
    public function index(): JsonResponse
    {
        $certificates = Certificate::where('user_id', auth()->id())
            ->with(['course:id,title,thumbnail', 'course.teacher:id,name'])
            ->latest('issued_at')
            ->get();

        return response()->json($certificates);
    }

    public function download(int $id): Response
    {
        $certificate = Certificate::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $certificate->load(['user:id,name', 'course:id,title', 'course.teacher:id,name']);

        $pdf = Pdf::loadView('certificates.certificate', [
            'certificate' => $certificate,
            'user' => $certificate->user,
            'course' => $certificate->course,
            'issued_at' => $certificate->issued_at->format('F j, Y'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download("certificate-{$certificate->certificate_number}.pdf");
    }
}
