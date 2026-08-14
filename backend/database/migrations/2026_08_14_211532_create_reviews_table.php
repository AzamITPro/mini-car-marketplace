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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // المشتري صاحب التقييم
            $table->foreignId('dealer_id')->constrained('users')->cascadeOnDelete(); // المعرض أو البائع المقيَّم
            $table->foreignId('car_id')->nullable()->constrained('cars')->cascadeOnDelete(); // السيارة المرتبطة
            $table->integer('rating')->default(5); // التقييم من 1 إلى 5 نجوم
            $table->text('comment')->nullable(); // تعليق وملاحظة المشتري
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
