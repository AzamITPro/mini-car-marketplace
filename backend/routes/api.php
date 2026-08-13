<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CarController;

/*
|--------------------------------------------------------------------------
| API Routes - Mini Car Marketplace
|--------------------------------------------------------------------------
*/

// مسارات السيارات المكتملة (index, store, show, update, destroy)
Route::apiResource('cars', CarController::class);
