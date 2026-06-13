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
        Schema::table('settings', function (Blueprint $table) {
            $table->text('jam_pelayanan')->nullable();
            $table->text('visi')->nullable();
            $table->text('misi')->nullable();
            $table->string('luas_wilayah')->nullable();
            $table->string('jumlah_penduduk')->nullable();
            $table->string('jumlah_rt')->nullable();
            $table->string('jumlah_rw')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn([
                'jam_pelayanan',
                'visi',
                'misi',
                'luas_wilayah',
                'jumlah_penduduk',
                'jumlah_rt',
                'jumlah_rw'
            ]);
        });
    }
};
