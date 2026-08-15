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
        Schema::create('dealer_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('commercial_record'); // مسار ملف السجل التجاري
            $table->string('license_document'); // مسار ملف رخصة مزاولة المهنة / البلدية
            $table->string('national_id_document'); // مسار ملف الهوية الوطنية للمالك
            $table->string('showroom_address'); // العنوان الفعلي الدقيق للمعرض
            $table->string('showroom_photo')->nullable(); // صورة واجهة المعرض واللافتة
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending'); // حالة المراجعة
            $table->text('admin_notes')->nullable(); // ملاحظات الإدارة في حال الرفض أو القبول
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dealer_verifications');
    }
};
