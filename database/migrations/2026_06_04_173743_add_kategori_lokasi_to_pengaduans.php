<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddKategoriLokasiToPengaduans extends Migration
{
    public function up()
    {
        Schema::table('pengaduans', function (Blueprint $table) {
            $table->string('kategori', 100)->nullable()->after('isi');
            $table->string('lokasi', 255)->nullable()->after('kategori');
        });
    }

    public function down()
    {
        Schema::table('pengaduans', function (Blueprint $table) {
            $table->dropColumn(['kategori', 'lokasi']);
        });
    }
}
