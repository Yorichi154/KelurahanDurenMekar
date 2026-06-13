<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('surat_pickups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('surats')->cascadeOnDelete();
            $table->string('nomor_surat');
            $table->string('nomor_antrian');
            $table->date('tanggal_pengambilan');
            $table->string('status_pengambilan')->default('menunggu'); // menunggu, siap, diambil
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surat_pickups');
    }
};
