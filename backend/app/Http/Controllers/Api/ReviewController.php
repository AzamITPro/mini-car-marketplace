<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Display reviews and calculate average rating for a dealer/seller.
     */
    public function index($dealerId)
    {
        $dealer = User::find($dealerId);

        if (!$dealer) {
            return response()->json([
                'status'  => false,
                'message' => 'البائع أو المعرض غير موجود'
            ], 404);
        }

        $reviews = $dealer->receivedReviews()->with('user:id,name')->latest()->get();
        $averageRating = round($dealer->receivedReviews()->avg('rating') ?? 5.0, 1);
        $totalReviews = $dealer->receivedReviews()->count();

        return response()->json([
            'status'         => true,
            'dealer_name'    => $dealer->showroom_name ?: $dealer->name,
            'average_rating' => $averageRating,
            'total_reviews'  => $totalReviews,
            'data'           => $reviews
        ], 200);
    }

    /**
     * Store a new rating & review from an authenticated buyer.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'dealer_id' => 'required|exists:users,id',
            'car_id'    => 'nullable|exists:cars,id',
            'rating'    => 'required|integer|min:1|max:5',
            'comment'   => 'nullable|string|max:1000',
        ]);

        // منع البائع من تقييم نفسه
        if ($validatedData['dealer_id'] == $request->user()->id) {
            return response()->json([
                'status'  => false,
                'message' => 'عذراً، لا يمكنك تقييم معرضك أو حسابك الشخصي 🚫'
            ], 422);
        }

        $review = Review::updateOrCreate(
            [
                'user_id'   => $request->user()->id,
                'dealer_id' => $validatedData['dealer_id'],
            ],
            [
                'car_id'  => $validatedData['car_id'] ?? null,
                'rating'  => $validatedData['rating'],
                'comment' => $validatedData['comment'] ?? null,
            ]
        );

        return response()->json([
            'status'  => true,
            'message' => 'شكراً لك! تم تسجيل تقييمك بنجاح ⭐',
            'data'    => $review
        ], 201);
    }
}
