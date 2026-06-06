<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LaporanController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('layouts.public');
})->name('home');

// Auth routes (Laravel Breeze)
require __DIR__.'/auth.php';

// ==================== WEB ROUTES (Blade) ====================
Route::middleware(['auth'])->group(function () {

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin Routes
    Route::get('/admin/laporan', [LaporanController::class, 'index'])->name('admin.laporan');

    // ✅ ROUTE /current-user (Sesuai Standar Arsitektur Tahap 1)
    // Digunakan oleh auth.js untuk mengambil data user setelah login berhasil.
    // Tidak perlu deklarasi middleware('auth') lagi karena sudah berada di dalam group.
    Route::get('/current-user', function () {
        $user = auth()->user();

        return response()->json([
            'id'     => $user->id,
            'name'   => $user->name,
            'email'  => $user->email,
            'role'   => $user->role,
            'rt'     => $user->rt ?? null,
            'rw'     => $user->rw ?? null,
            'nik'    => $user->nik ?? null,
            'telp'   => $user->telp ?? null,
            'alamat' => $user->alamat ?? null,
        ]);
    })->name('current.user');

});
