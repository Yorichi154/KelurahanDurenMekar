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
    Schema::create('unit_kerjas', function (Blueprint $table) {
        $table->id();

        $table->string('jenis');
        $table->string('nama_unit');

        $table->string('nama_pimpinan')->nullable();
        $table->string('jabatan_pimpinan')->nullable();

        $table->string('kontak')->nullable();
        $table->string('email')->nullable();

        $table->text('alamat')->nullable();
        $table->text('tugas')->nullable();
        $table->text('kewenangan')->nullable();

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_kerjas');
    }
};
