<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddKategoriRingkasanToPengumumen extends Migration
{
    public function up()
    {
        Schema::table('pengumumen', function (Blueprint $table) {
            $table->string('kategori', 100)->nullable()->after('title');
            $table->text('ringkasan')->nullable()->after('kategori');
        });
    }

    public function down()
    {
        Schema::table('pengumumen', function (Blueprint $table) {
            $table->dropColumn(['kategori', 'ringkasan']);
        });
    }
}
