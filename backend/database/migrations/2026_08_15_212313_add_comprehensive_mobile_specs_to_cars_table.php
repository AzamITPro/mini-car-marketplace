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
            $table->string('vin')->nullable()->after('model'); // رقم الهيكل / الشاسيه
            $table->integer('owners_count')->default(1)->after('mileage'); // عدد الملاك السابقين (1. Hand)
            $table->boolean('is_accident_free')->default(true)->after('condition'); // خالية من الحوادث (Unfallfrei)
            $table->boolean('has_service_history')->default(true)->after('is_accident_free'); // سجل الصيانة بالوكالة (Scheckheftgepflegt)
            $table->integer('warranty_months')->nullable()->after('has_service_history'); // مدة الضمان بالأشهر (Garantie)
            $table->date('tuv_valid_until')->nullable()->after('warranty_months'); // سريان الفحص الفني (TÜV)
            $table->json('features')->nullable()->after('description'); // قائمة الكماليات والتجهيزات كـ JSON
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropColumn([
                'vin',
                'owners_count',
                'is_accident_free',
                'has_service_history',
                'warranty_months',
                'tuv_valid_until',
                'features'
            ]);
        });
    }
};
