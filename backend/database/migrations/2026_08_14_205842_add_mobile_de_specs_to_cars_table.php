<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->integer('mileage')->nullable()->after('year'); // العداد بالكيلومترات
            $table->enum('transmission', ['automatic', 'manual'])->default('automatic')->after('mileage'); // ناقل الحركة
            $table->enum('fuel_type', ['petrol', 'diesel', 'hybrid', 'electric'])->default('petrol')->after('transmission'); // نوع الوقود
            $table->integer('engine_power')->nullable()->after('fuel_type'); // قوة المحرك بالأحصنة HP
            $table->enum('body_type', ['suv', 'sedan', 'hatchback', 'coupe', 'truck', 'van'])->default('sedan')->after('engine_power'); // نوع الهيكل
            $table->enum('status', ['active', 'sold', 'reserved'])->default('active')->after('is_available'); // حالة الإعلان
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropColumn(['mileage', 'transmission', 'fuel_type', 'engine_power', 'body_type', 'status']);
        });
    }
};
