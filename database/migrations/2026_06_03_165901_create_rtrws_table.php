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
    Schema::create('rtrws', function (Blueprint $table) {
        $table->id();

        $table->string('rt');
        $table->string('rw');

        $table->string('ketua');
        $table->string('alamat')->nullable();
        $table->string('telepon')->nullable();

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rtrws');
    }
};
