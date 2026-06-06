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
   Schema::table('users', function (Blueprint $table) {
        $table->string('role')->default('warga');
        $table->string('nik')->nullable();
        $table->string('telp')->nullable();
        $table->text('alamat')->nullable();
        $table->string('rt')->nullable();
        $table->string('rw')->nullable();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn([
            'role',
            'nik',
            'telp',
            'alamat',
            'rt',
            'rw'
        ]);
    });

    }
};
