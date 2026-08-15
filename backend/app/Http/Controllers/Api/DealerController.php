<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class DealerController extends Controller
{
    /**
     * Display a listing of all certified showrooms and rental agencies.
     */
    public function index()
    {
        $dealers = User::whereIn('role', ['dealer', 'rental_agency'])
            ->withCount(['cars' => function ($q) {
                $q->where('is_available', true);
            }])
            ->with('receivedReviews')
            ->get()
            ->map(function ($dealer) {
                return [
                    'id'             => $dealer->id,
                    'name'           => $dealer->name,
                    'showroom_name'  => $dealer->showroom_name ?: $dealer->name,
                    'role'           => $dealer->role,
                    'phone'          => $dealer->phone,
                    'city'           => $dealer->city ?: 'صنعاء',
                    'is_verified'    => $dealer->is_verified,
                    'cars_count'     => $dealer->cars_count,
                    'average_rating' => round($dealer->receivedReviews->avg('rating') ?? 5.0, 1),
                    'total_reviews'  => $dealer->receivedReviews->count(),
                ];
            });

        return response()->json([
            'status' => true,
            'data'   => $dealers
        ], 200);
    }

    /**
     * Display the specified showroom storefront profile with its cars and reviews.
     */
    public function show($id)
    {
        $dealer = User::whereIn('role', ['dealer', 'rental_agency', 'user'])
            ->with(['cars' => function ($q) {
                $q->where('is_available', true)->latest();
            }, 'receivedReviews.user:id,name'])
            ->find($id);

        if (!$dealer) {
            return response()->json([
                'status'  => false,
                'message' => 'المعرض أو البائع غير موجود'
            ], 404);
        }

        $averageRating = round($dealer->receivedReviews->avg('rating') ?? 5.0, 1);
        $totalReviews = $dealer->receivedReviews->count();

        return response()->json([
            'status' => true,
            'data'   => [
                'id'             => $dealer->id,
                'name'           => $dealer->name,
                'showroom_name'  => $dealer->showroom_name ?: $dealer->name,
                'role'           => $dealer->role,
                'phone'          => $dealer->phone,
                'city'           => $dealer->city ?: 'صنعاء',
                'is_verified'    => $dealer->is_verified,
                'average_rating' => $averageRating,
                'total_reviews'  => $totalReviews,
                'cars'           => $dealer->cars,
                'reviews'        => $dealer->receivedReviews,
            ]
        ], 200);
    }
}
