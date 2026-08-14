<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarController extends Controller
{
    /**
     * Display a listing of cars with advanced mobile.de-style search & filters.
     */
    public function index(Request $request)
    {
        $query = Car::with('user:id,name,email,role,phone,showroom_name,city,is_verified')
            ->where('is_available', true);

        // 1. البحث النصي
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('brand', 'ilike', "%{$search}%")
                  ->orWhere('model', 'ilike', "%{$search}%")
                  ->orWhere('city', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        // 2. الفلاتر الأساسية
        if ($request->filled('transaction_type')) {
            $query->where('transaction_type', $request->transaction_type);
        }
        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }
        if ($request->filled('transmission')) {
            $query->where('transmission', $request->transmission);
        }
        if ($request->filled('fuel_type')) {
            $query->where('fuel_type', $request->fuel_type);
        }
        if ($request->filled('body_type')) {
            $query->where('body_type', $request->body_type);
        }

        // 3. فلترة نطاقات الأسعار وسنة الصنع والعداد
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->filled('max_mileage')) {
            $query->where('mileage', '<=', $request->max_mileage);
        }
        if ($request->filled('min_year')) {
            $query->where('year', '>=', $request->min_year);
        }

        // 4. فلترة نوع البائع (معارض معتمدة أم أفراد)
        if ($request->filled('seller_type')) {
            if ($request->seller_type === 'dealer') {
                $query->whereHas('user', fn($q) => $q->where('role', 'dealer'));
            } elseif ($request->seller_type === 'private') {
                $query->whereHas('user', fn($q) => $q->where('role', 'user'));
            }
        }

        $cars = $query->latest()->get();

        return response()->json([
            'status' => true,
            'data'   => $cars
        ], 200);
    }

    /**
     * Display cars owned by the authenticated user.
     */
    public function myCars(Request $request)
    {
        $cars = $request->user()->cars()->latest()->get();

        return response()->json([
            'status' => true,
            'data'   => $cars
        ], 200);
    }

    /**
     * Display the specified car details.
     */
    public function show($id)
    {
        $car = Car::with('user:id,name,email,role,phone,showroom_name,city,is_verified')->find($id);

        if (!$car) {
            return response()->json([
                'status'  => false,
                'message' => 'السيارة غير موجودة'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data'   => $car
        ], 200);
    }

    /**
     * Store a newly created car with full specs.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'brand'            => 'required|string|max:255',
            'model'            => 'required|string|max:255',
            'year'             => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'price'            => 'required|numeric|min:0',
            'transaction_type' => 'required|in:sale,rent',
            'description'      => 'nullable|string',
            'city'             => 'required|string|max:255',
            'condition'        => 'required|in:new,used',
            'mileage'          => 'nullable|integer|min:0',
            'transmission'     => 'nullable|in:automatic,manual',
            'fuel_type'        => 'nullable|in:petrol,diesel,hybrid,electric',
            'engine_power'     => 'nullable|integer|min:0',
            'body_type'        => 'nullable|in:suv,sedan,hatchback,coupe,truck,van',
            'image'            => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $validatedData['user_id'] = $request->user()->id;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('cars', 'public');
            $validatedData['image_url'] = '/storage/' . $imagePath;
        }

        $car = Car::create($validatedData);

        return response()->json([
            'status'  => true,
            'message' => 'تمت إضافة السيارة بنجاح',
            'data'    => $car
        ], 201);
    }

    /**
     * Update the specified car.
     */
    public function update(Request $request, $id)
    {
        $car = Car::find($id);

        if (!$car) {
            return response()->json([
                'status'  => false,
                'message' => 'السيارة غير موجودة'
            ], 404);
        }

        if ($car->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json([
                'status'  => false,
                'message' => 'غير مصرح لك: لا يمكنك تعديل سيارة لا تملكها'
            ], 403);
        }

        $validatedData = $request->validate([
            'brand'            => 'sometimes|string|max:255',
            'model'            => 'sometimes|string|max:255',
            'year'             => 'sometimes|integer|min:1900|max:' . (date('Y') + 1),
            'price'            => 'sometimes|numeric|min:0',
            'transaction_type' => 'sometimes|in:sale,rent',
            'description'      => 'nullable|string',
            'city'             => 'sometimes|string|max:255',
            'condition'        => 'sometimes|in:new,used',
            'mileage'          => 'nullable|integer|min:0',
            'transmission'     => 'nullable|in:automatic,manual',
            'fuel_type'        => 'nullable|in:petrol,diesel,hybrid,electric',
            'engine_power'     => 'nullable|integer|min:0',
            'body_type'        => 'nullable|in:suv,sedan,hatchback,coupe,truck,van',
            'status'           => 'sometimes|in:active,sold,reserved',
            'is_available'     => 'sometimes|boolean',
            'image'            => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            if ($car->image_url) {
                $oldPath = str_replace('/storage/', '', $car->image_url);
                Storage::disk('public')->delete($oldPath);
            }
            $imagePath = $request->file('image')->store('cars', 'public');
            $validatedData['image_url'] = '/storage/' . $imagePath;
        }

        $car->update($validatedData);

        return response()->json([
            'status'  => true,
            'message' => 'تم تعديل بيانات السيارة بنجاح',
            'data'    => $car
        ], 200);
    }

    /**
     * Remove the specified car.
     */
    public function destroy(Request $request, $id)
    {
        $car = Car::find($id);

        if (!$car) {
            return response()->json([
                'status'  => false,
                'message' => 'السيارة غير موجودة'
            ], 404);
        }

        if ($car->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json([
                'status'  => false,
                'message' => 'غير مصرح لك: لا يمكنك حذف سيارة لا تملكها'
            ], 403);
        }

        if ($car->image_url) {
            $oldPath = str_replace('/storage/', '', $car->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        $car->delete();

        return response()->json([
            'status'  => true,
            'message' => 'تم حذف السيارة بنجاح'
        ], 200);
    }
}
