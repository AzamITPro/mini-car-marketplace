<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Display all favorite cars for the authenticated user.
     */
    public function index(Request $request)
    {
        $favorites = $request->user()->favoriteCars()->with('user:id,name,email')->get();

        return response()->json([
            'status' => true,
            'data'   => $favorites
        ], 200);
    }

    /**
     * Toggle favorite status (Add if not favorited, Remove if already favorited).
     */
    public function toggle(Request $request, $carId)
    {
        $car = Car::find($carId);

        if (!$car) {
            return response()->json([
                'status'  => false,
                'message' => 'السيارة غير موجودة'
            ], 404);
        }

        // دالة toggle الذكية: إذا كانت مضافة تحذفها، وإذا لم تكن مضافة تضيفها
        $result = $request->user()->favoriteCars()->toggle($carId);

        $isFavorited = count($result['attached']) > 0;

        return response()->json([
            'status'       => true,
            'is_favorited' => $isFavorited,
            'message'      => $isFavorited ? 'تمت إضافة السيارة إلى المفضلة ❤️' : 'تمت إزالة السيارة من المفضلة 🤍'
        ], 200);
    }
}
