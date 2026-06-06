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
Schema::create('pengumumen', function (Blueprint $table) {

    $table->id();

    $table->string('title');

    $table->date('date')->nullable();

    $table->enum('status', [
        'info',
        'urgent'
    ])->default('info');

    $table->text('content');

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengumumen');
    }
};
