<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DealerVerification;
use App\Models\User;
use Illuminate\Http\Request;

class DealerVerificationController extends Controller
{
    /**
     * Submit verification request with business documents.
     */
    public function apply(Request $request)
    {
        $validatedData = $request->validate([
            'commercial_record'    => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'license_document'     => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'national_id_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'showroom_address'     => 'required|string|max:255',
            'showroom_photo'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
        ]);

        $commPath = $request->file('commercial_record')->store('verifications/commercial', 'public');
        $licPath = $request->file('license_document')->store('verifications/licenses', 'public');
        $idPath = $request->file('national_id_document')->store('verifications/ids', 'public');
        $photoPath = $request->hasFile('showroom_photo')
            ? $request->file('showroom_photo')->store('verifications/showrooms', 'public')
            : null;

        $verification = DealerVerification::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'commercial_record'    => '/storage/' . $commPath,
                'license_document'     => '/storage/' . $licPath,
                'national_id_document' => '/storage/' . $idPath,
                'showroom_address'     => $validatedData['showroom_address'],
                'showroom_photo'       => $photoPath ? '/storage/' . $photoPath : null,
                'status'               => 'pending',
                'admin_notes'          => null,
            ]
        );

        return response()->json([
            'status'  => true,
            'message' => 'تم تقديم وثائق المعرض بنجاح. طلبك الآن قيد مراجعة وتدقيق الإدارة 📋✓',
            'data'    => $verification
        ], 201);
    }

    /**
     * Check verification status for the authenticated dealer.
     */
    public function myStatus(Request $request)
    {
        $verification = $request->user()->verification;

        return response()->json([
            'status'       => true,
            'is_verified'  => (bool)$request->user()->is_verified,
            'verification' => $verification
        ], 200);
    }

    /**
     * [Admin] List all verification requests.
     */
    public function adminIndex(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'غير مصرح'], 403);
        }

        $requests = DealerVerification::with('user:id,name,email,role,showroom_name,phone,city,is_verified')
            ->latest()
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $requests
        ], 200);
    }

    /**
     * [Admin] Approve and verify showroom.
     */
    public function adminApprove(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'غير مصرح'], 403);
        }

        $verification = DealerVerification::findOrFail($id);
        $verification->update([
            'status'      => 'approved',
            'admin_notes' => 'تمت مراجعة الوثائق والموافقة على اعتماد وتوثيق المعرض رسميًا'
        ]);

        $verification->user()->update(['is_verified' => true]);

        return response()->json([
            'status'  => true,
            'message' => 'تم اعتماد المعرض بنجاح ومنحه شارة التوثيق الرسمية ✓'
        ], 200);
    }

    /**
     * [Admin] Reject showroom verification.
     */
    public function adminReject(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'غير مصرح'], 403);
        }

        $request->validate(['reason' => 'required|string']);

        $verification = DealerVerification::findOrFail($id);
        $verification->update([
            'status'      => 'rejected',
            'admin_notes' => $request->reason
        ]);

        $verification->user()->update(['is_verified' => false]);

        return response()->json([
            'status'  => true,
            'message' => 'تم رفض طلب التوثيق وتدوين ملاحظة الإدارة'
        ], 200);
    }
}
