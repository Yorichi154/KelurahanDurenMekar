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
    Schema::table('pelayanans', function (Blueprint $table) {
        $table->string('teks_tombol')->nullable();
    });
}

public function down(): void
{
    Schema::table('pelayanans', function (Blueprint $table) {
        $table->dropColumn('teks_tombol');
    });
}
};
