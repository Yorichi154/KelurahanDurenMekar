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
Schema::create('settings', function (Blueprint $table) {

    $table->id();

    $table->string('site_name')->nullable();

    $table->string('email')->nullable();

    $table->string('phone')->nullable();

    $table->text('address')->nullable();

    $table->string('instagram')->nullable();

    $table->string('lurah_name')->nullable();

    $table->string('kecamatan')->nullable();

    $table->string('kota')->nullable();

    $table->string('provinsi')->nullable();

    $table->string('kodepos')->nullable();

    $table->longText('profil')->nullable();

    $table->longText('maps')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
