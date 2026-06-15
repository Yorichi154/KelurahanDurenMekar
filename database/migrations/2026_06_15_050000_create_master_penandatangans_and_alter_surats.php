<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create master_penandatangans table
        Schema::create('master_penandatangans', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('jabatan');
            $table->string('nip');
            $table->boolean('status_aktif')->default(true);
            $table->timestamps();
        });

        // 2. Alter surats table: drop constraint, change user_id to nullable, and re-add constraint
        Schema::table('surats', function (Blueprint $table) {
            // Drop foreign key if exists
            try {
                $table->dropForeign(['user_id']);
            } catch (\Throwable $e) {
                // Ignore if it doesn't exist under this name
            }
        });

        Schema::table('surats', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            
            if (!Schema::hasColumn('surats', 'konten_final')) {
                $table->longText('konten_final')->nullable()->after('file_surat');
            }
        });

        // 3. Add deskripsi_surat column to surat_types
        Schema::table('surat_types', function (Blueprint $table) {
            if (!Schema::hasColumn('surat_types', 'deskripsi_surat')) {
                $table->text('deskripsi_surat')->nullable()->after('deskripsi');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_penandatangans');

        Schema::table('surats', function (Blueprint $table) {
            try {
                $table->dropForeign(['user_id']);
            } catch (\Throwable $e) {}
            $table->dropColumn('konten_final');
        });

        Schema::table('surats', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->change();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('surat_types', function (Blueprint $table) {
            $table->dropColumn('deskripsi_surat');
        });
    }
};
