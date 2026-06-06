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
Schema::create('beritas', function (Blueprint $table) {
    $table->id();

    $table->string('title');
    $table->string('category')->nullable();
    $table->date('date')->nullable();

    $table->string('image')->nullable();

    $table->text('excerpt')->nullable();
    $table->longText('content')->nullable();

    $table->enum('status', [
        'draft',
        'published'
    ])->default('draft');

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beritas');
    }
};
