<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\DealerController;
use App\Http\Controllers\Api\DealerVerificationController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\RentalController;
use App\Http\Controllers\Api\ReviewController;

/*
|--------------------------------------------------------------------------
| API Routes - Mini Car Marketplace
|--------------------------------------------------------------------------
*/

// 1. المسارات العامة
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/cars', [CarController::class, 'index']);
Route::get('/cars/{id}', [CarController::class, 'show']);

// مسارات المعارض والتقييمات
Route::get('/dealers', [DealerController::class, 'index']);
Route::get('/dealers/{id}', [DealerController::class, 'show']);
Route::get('/dealers/{dealerId}/reviews', [ReviewController::class, 'index']);

// 2. المسارات المحمية بـ Sanctum (تتطلب Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // مسارات إدارة سيارات المستخدم
    Route::get('/my-cars', [CarController::class, 'myCars']);
    Route::post('/cars', [CarController::class, 'store']);
    Route::put('/cars/{id}', [CarController::class, 'update']);
    Route::delete('/cars/{id}', [CarController::class, 'destroy']);

    // مسارات المفضلة
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/toggle/{carId}', [FavoriteController::class, 'toggle']);

    // مسارات التأجير والحجوزات
    Route::get('/rentals', [RentalController::class, 'index']);
    Route::post('/rentals', [RentalController::class, 'store']);
    Route::post('/rentals/{id}/cancel', [RentalController::class, 'cancel']);

    // مسار إضافة تقييم بالنجوم
    Route::post('/reviews', [ReviewController::class, 'store']);

    // مسارات توثيق واعتماد المعارض
    Route::post('/dealer/verify/apply', [DealerVerificationController::class, 'apply']);
    Route::get('/dealer/verify/status', [DealerVerificationController::class, 'myStatus']);

    // مسارات الإدارة لاعتماد المعارض
    Route::get('/admin/verifications', [DealerVerificationController::class, 'adminIndex']);
    Route::post('/admin/verifications/{id}/approve', [DealerVerificationController::class, 'adminApprove']);
    Route::post('/admin/verifications/{id}/reject', [DealerVerificationController::class, 'adminReject']);
});
