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
    Schema::create('pelayanans', function (Blueprint $table) {
        $table->id();

        $table->string('nama');
        $table->string('slug')->unique();

        $table->string('estimasi')->nullable();
        $table->string('biaya')->nullable();

        $table->boolean('online')->default(false);

        $table->json('syarat')->nullable();
        $table->json('langkah')->nullable();
        $table->json('form_fields')->nullable();

        $table->text('jam_pelayanan')->nullable();
        $table->text('lokasi')->nullable();
        $table->text('catatan')->nullable();

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pelayanans');
    }
};
