<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\FavoriteController;

/*
|--------------------------------------------------------------------------
| API Routes - Mini Car Marketplace
|--------------------------------------------------------------------------
*/

// 1. المسارات العامة (متاحة للجميع)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/cars', [CarController::class, 'index']);
Route::get('/cars/{id}', [CarController::class, 'show']);

// 2. المسارات المحمية بـ Sanctum (تتطلب Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/cars', [CarController::class, 'store']);
    Route::put('/cars/{id}', [CarController::class, 'update']);
    Route::delete('/cars/{id}', [CarController::class, 'destroy']);

    // مسارات المفضلة
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/toggle/{carId}', [FavoriteController::class, 'toggle']);
});
