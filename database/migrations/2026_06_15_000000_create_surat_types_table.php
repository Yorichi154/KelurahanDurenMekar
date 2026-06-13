<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop dependent tables first to avoid foreign key violations
        Schema::dropIfExists('template_surats');
        Schema::dropIfExists('pelayanans');

        // Create surat_types table
        Schema::create('surat_types', function (Blueprint $table) {
            $table->id();
            $table->string('nama_surat');
            $table->string('kode_surat')->unique();
            $table->text('deskripsi')->nullable();
            $table->integer('estimasi_hari')->default(1);
            $table->string('metode_pengajuan')->default('online'); // online, offline
            $table->string('metode_hasil')->default('download'); // download, pickup
            $table->string('status')->default('aktif'); // aktif, nonaktif
            
            // Include form builder columns for compatibility with Pelayanan model
            $table->json('syarat')->nullable();
            $table->json('langkah')->nullable();
            $table->json('form_fields')->nullable();
            $table->string('teks_tombol')->nullable();
            $table->string('biaya')->nullable();
            $table->text('jam_pelayanan')->nullable();
            $table->text('lokasi')->nullable();

            $table->timestamps();
        });

        // Re-create template_surats table referencing surat_types.id as pelayanan_id for backwards compatibility
        Schema::create('template_surats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pelayanan_id')->constrained('surat_types')->cascadeOnDelete();
            $table->longText('konten_html');
            $table->integer('versi')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('template_surats');
        Schema::dropIfExists('surat_types');
    }
};
