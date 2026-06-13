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
    try {
        $tables = \Illuminate\Support\Facades\Schema::getAllTables();
        $tableNames = [];
        foreach ($tables as $t) {
            $tableNames[] = reset($t);
        }
    } catch (\Throwable $e) {
        $results = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
        $tableNames = array_map('current', $results);
    }
    
    foreach ($tableNames as $tableName) {
        if (in_array($tableName, ['migrations', 'failed_jobs', 'personal_access_tokens', 'password_reset_tokens'])) {
            continue;
        }
        
        try {
            $columns = \Illuminate\Support\Facades\Schema::getColumnListing($tableName);
            $rows = \Illuminate\Support\Facades\DB::table($tableName)->get();
            
            foreach ($rows as $row) {
                $update = [];
                foreach ($columns as $column) {
                    $value = $row->{$column};
                    if (is_string($value) && (stripos($value, 'localhost') !== false || stripos($value, '127.0.0.1') !== false)) {
                        $newValue = preg_replace('/https?:\/\/localhost:8000\//i', '/', $value);
                        $newValue = preg_replace('/https?:\/\/127\.0\.0\.1:8000\//i', '/', $newValue);
                        $newValue = preg_replace('/https?:\/\/localhost\//i', '/', $newValue);
                        $newValue = preg_replace('/https?:\/\/127\.0\.0\.1\//i', '/', $newValue);
                        
                        if ($newValue !== $value) {
                            $update[$column] = $newValue;
                        }
                    }
                }
                
                if (!empty($update)) {
                    $idCol = 'id';
                    if (!property_exists($row, 'id')) {
                        $idCol = $columns[0];
                    }
                    
                    \Illuminate\Support\Facades\DB::table($tableName)->where($idCol, $row->{$idCol})->update($update);
                }
            }
        } catch (\Throwable $e) {
            // Ignore
        }
    }

    return view('layouts.public');
})->name('home');

// Auth routes (Laravel Breeze)
require __DIR__.'/auth.php';

// Route to get a fresh CSRF token dynamically
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

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

Route::get('/fix-localhost', function () {
    try {
        $tables = \Illuminate\Support\Facades\Schema::getAllTables();
        $tableNames = [];
        foreach ($tables as $t) {
            $tableNames[] = reset($t);
        }
    } catch (\Throwable $e) {
        $results = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
        $tableNames = array_map('current', $results);
    }
    
    $log = [];
    foreach ($tableNames as $tableName) {
        if (in_array($tableName, ['migrations', 'failed_jobs', 'personal_access_tokens', 'password_reset_tokens'])) {
            continue;
        }
        
        try {
            $columns = \Illuminate\Support\Facades\Schema::getColumnListing($tableName);
            $rows = \Illuminate\Support\Facades\DB::table($tableName)->get();
            
            foreach ($rows as $row) {
                $update = [];
                foreach ($columns as $column) {
                    $value = $row->{$column};
                    if (is_string($value) && (stripos($value, 'localhost') !== false || stripos($value, '127.0.0.1') !== false)) {
                        $newValue = preg_replace('/https?:\/\/localhost:8000\//i', '/', $value);
                        $newValue = preg_replace('/https?:\/\/127\.0\.0\.1:8000\//i', '/', $newValue);
                        $newValue = preg_replace('/https?:\/\/localhost\//i', '/', $newValue);
                        $newValue = preg_replace('/https?:\/\/127\.0\.0\.1\//i', '/', $newValue);
                        
                        if ($newValue !== $value) {
                            $update[$column] = $newValue;
                        }
                    }
                }
                
                if (!empty($update)) {
                    $idCol = 'id';
                    if (!property_exists($row, 'id')) {
                        $idCol = $columns[0];
                    }
                    
                    \Illuminate\Support\Facades\DB::table($tableName)->where($idCol, $row->{$idCol})->update($update);
                    $log[] = "Updated table '$tableName' ID {$row->{$idCol}}: " . json_encode(array_keys($update));
                }
            }
        } catch (\Throwable $e) {
            $log[] = "Error processing table '$tableName': " . $e->getMessage();
        }
    }
    return response()->json([
        'status' => 'success',
        'updated' => $log
    ]);
});

Route::get('/check-berita', function() {
    return response()->json(\App\Models\Berita::all());
});

Route::get('/dump-berita', function() {
    $berita = \App\Models\Berita::all()->toArray();
    file_put_contents(storage_path('logs/berita_dump.json'), json_encode($berita, JSON_PRETTY_PRINT));
    return "OK";
});

