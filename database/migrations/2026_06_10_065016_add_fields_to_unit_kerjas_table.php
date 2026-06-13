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
        Schema::table('unit_kerjas', function (Blueprint $table) {
            $table->string('foto_pimpinan')->nullable()->after('jabatan_pimpinan');
            $table->string('nip_pimpinan')->nullable()->after('foto_pimpinan');
            $table->string('pendidikan_pimpinan')->nullable()->after('nip_pimpinan');
            $table->text('riwayat_jabatan')->nullable()->after('email');
            $table->text('tim_pegawai')->nullable()->after('kewenangan'); // JSON encoded array or text
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('unit_kerjas', function (Blueprint $table) {
            $table->dropColumn([
                'foto_pimpinan',
                'nip_pimpinan',
                'pendidikan_pimpinan',
                'riwayat_jabatan',
                'tim_pegawai'
            ]);
        });
    }
};
