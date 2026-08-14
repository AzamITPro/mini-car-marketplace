<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarController extends Controller
{
    /**
     * Display a listing of cars with search and filtering.
     */
    public function index(Request $request)
    {
        $query = Car::with('user:id,name,email')->where('is_available', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('brand', 'ilike', "%{$search}%")
                  ->orWhere('model', 'ilike', "%{$search}%")
                  ->orWhere('city', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('transaction_type')) {
            $query->where('transaction_type', $request->transaction_type);
        }

        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $cars = $query->latest()->get();

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
        $car = Car::with('user:id,name,email')->find($id);

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
     * Store a newly created car with optional image upload.
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
            'image'            => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $validatedData['user_id'] = $request->user()->id;

        // معالجة وحفظ ملف الصورة إن تم إرفاقه
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

        $validatedData = $request->validate([
            'brand'            => 'sometimes|string|max:255',
            'model'            => 'sometimes|string|max:255',
            'year'             => 'sometimes|integer|min:1900|max:' . (date('Y') + 1),
            'price'            => 'sometimes|numeric|min:0',
            'transaction_type' => 'sometimes|in:sale,rent',
            'description'      => 'nullable|string',
            'city'             => 'sometimes|string|max:255',
            'condition'        => 'sometimes|in:new,used',
            'is_available'     => 'sometimes|boolean',
            'image'            => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            // حذف الصورة القديمة لتوفير المساحة
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
    public function destroy($id)
    {
        $car = Car::find($id);

        if (!$car) {
            return response()->json([
                'status'  => false,
                'message' => 'السيارة غير موجودة'
            ], 404);
        }

        // حذف الصورة المرتبطة قبل حذف السجل من قاعدة البيانات
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
