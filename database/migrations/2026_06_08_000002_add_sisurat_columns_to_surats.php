<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('surats', function (Blueprint $table) {
            if (!Schema::hasColumn('surats', 'nomor_surat')) {
                $table->string('nomor_surat')->nullable()->after('id');
            }
            if (!Schema::hasColumn('surats', 'data_surat')) {
                $table->json('data_surat')->nullable()->after('keperluan');
            }
            if (!Schema::hasColumn('surats', 'dibuat_oleh')) {
                $table->unsignedBigInteger('dibuat_oleh')->nullable()->after('data_surat');
                $table->foreign('dibuat_oleh')->references('id')->on('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('surats', 'catatan_staf')) {
                $table->text('catatan_staf')->nullable()->after('dibuat_oleh');
            }
        });
    }

    public function down(): void
    {
        Schema::table('surats', function (Blueprint $table) {
            $table->dropColumn(['nomor_surat', 'data_surat', 'catatan_staf']);
            if (Schema::hasColumn('surats', 'dibuat_oleh')) {
                $table->dropForeign(['dibuat_oleh']);
                $table->dropColumn('dibuat_oleh');
            }
        });
    }
};
