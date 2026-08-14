<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\Rental;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RentalController extends Controller
{
    /**
     * Display a listing of user's rentals.
     */
    public function index(Request $request)
    {
        $rentals = $request->user()->rentals()
            ->with('car:id,brand,model,year,price,image_url,city,condition')
            ->latest()
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $rentals
        ], 200);
    }

    /**
     * Book a car for rental.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'car_id'     => 'required|exists:cars,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $car = Car::find($validatedData['car_id']);

        // 1. التحقق من أن السيارة معروضة للتأجير
        if ($car->transaction_type !== 'rent') {
            return response()->json([
                'status'  => false,
                'message' => 'عذراً، هذه السيارة معروضة للبيع فقط وليست متاحة للتأجير'
            ], 422);
        }

        // 2. التحقق من عدم وجود تعارض في مواعيد الحجز لنفس السيارة
        $conflict = Rental::where('car_id', $car->id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($validatedData) {
                $query->whereBetween('start_date', [$validatedData['start_date'], $validatedData['end_date']])
                      ->orWhereBetween('end_date', [$validatedData['start_date'], $validatedData['end_date']])
                      ->orWhere(function ($q) use ($validatedData) {
                          $q->where('start_date', '<=', $validatedData['start_date'])
                            ->where('end_date', '>=', $validatedData['end_date']);
                      });
            })->exists();

        if ($conflict) {
            return response()->json([
                'status'  => false,
                'message' => 'السيارة محجوزة بالفعل خلال هذه الفترة الزمنية، يرجى اختيار تواريخ أخرى'
            ], 422);
        }

        // 3. حساب عدد الأيام والسعر الإجمالي تلقائياً
        $startDate = Carbon::parse($validatedData['start_date']);
        $endDate = Carbon::parse($validatedData['end_date']);
        $days = max(1, $startDate->diffInDays($endDate) + 1);
        $totalPrice = $days * $car->price;

        // 4. إنشاء الحجز
        $rental = Rental::create([
            'user_id'     => $request->user()->id,
            'car_id'      => $car->id,
            'start_date'  => $validatedData['start_date'],
            'end_date'    => $validatedData['end_date'],
            'total_price' => $totalPrice,
            'status'      => 'confirmed',
        ]);

        return response()->json([
            'status'      => true,
            'message'     => "تم تأكيد حجز السيارة بنجاح لمدة {$days} يوم بإجمالي \${$totalPrice} 🔑🎉",
            'data'        => $rental
        ], 201);
    }

    /**
     * Cancel a rental booking.
     */
    public function cancel(Request $request, $id)
    {
        $rental = $request->user()->rentals()->find($id);

        if (!$rental) {
            return response()->json([
                'status'  => false,
                'message' => 'الحجز غير موجود أو لا تملك صلاحية لإلغائه'
            ], 404);
        }

        $rental->update(['status' => 'cancelled']);

        return response()->json([
            'status'  => true,
            'message' => 'تم إلغاء الحجز بنجاح'
        ], 200);
    }
}
