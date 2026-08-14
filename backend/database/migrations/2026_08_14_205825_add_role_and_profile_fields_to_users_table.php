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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['user', 'dealer', 'rental_agency', 'admin'])->default('user')->after('email');
            $table->string('phone')->nullable()->after('role');
            $table->string('showroom_name')->nullable()->after('phone');
            $table->string('city')->nullable()->after('showroom_name');
            $table->boolean('is_verified')->default(false)->after('city');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'showroom_name', 'city', 'is_verified']);
        });
    }
};
