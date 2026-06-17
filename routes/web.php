<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LaporanController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Homepage publik
Route::get('/', function () {
    return view('layouts.public');
})->name('home');

// Auth routes (Laravel Breeze)
require __DIR__.'/auth.php';

// Endpoint untuk fresh CSRF token (dipakai frontend)
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

// ==================== WEB ROUTES (Blade, butuh auth) ====================
Route::middleware(['auth'])->group(function () {

    // Profile Routes (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin Routes
    Route::get('/admin/laporan', [LaporanController::class, 'index'])->name('admin.laporan');

    // Endpoint user saat ini (dipakai auth.js setelah login)
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

// ==================== DEBUG / MAINTENANCE ROUTES ====================
// Hanya aktif di environment 'local' (Laragon/dev).
// Tidak akan ter-register di production (APP_ENV=production di .env).
// Jika ingin menonaktifkan total, hapus seluruh blok ini.
if (app()->environment('local')) {

    // Perbaiki URL localhost di seluruh tabel (one-shot fix).
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

    // Cek isi tabel berita.
    Route::get('/check-berita', function () {
        return response()->json(\App\Models\Berita::all());
    });

    // Dump berita ke storage/logs/berita_dump.json.
    Route::get('/dump-berita', function () {
        $berita = \App\Models\Berita::all()->toArray();
        file_put_contents(storage_path('logs/berita_dump.json'), json_encode($berita, JSON_PRETTY_PRINT));
        return "OK";
    });

    // Debug konfigurasi DB (jangan pernah aktif di production).
    Route::get('/db-debug', function () {
        try {
            return response()->json([
                'default' => config('database.default'),
                'connection_details' => config('database.connections.' . config('database.default')),
                'env_database' => env('DB_DATABASE'),
                'pdo_database' => \DB::connection()->getDatabaseName(),
                'tables' => \DB::select('SHOW TABLES')
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    });

    // Cek schema semua tabel.
    Route::get('/check-schema', function () {
        try {
            $tables = \Illuminate\Support\Facades\Schema::getAllTables();
            $info = [];
            foreach ($tables as $t) {
                $name = reset($t);
                $info[$name] = \Illuminate\Support\Facades\Schema::getColumnListing($name);
            }
            return response()->json($info);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Cek status migrasi.
    Route::get('/migrate-status', function () {
        try {
            \Illuminate\Support\Facades\Artisan::call('migrate:status');
            return response()->json([
                'status' => 'success',
                'output' => \Illuminate\Support\Facades\Artisan::output()
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // One-shot: tambah kolom facebook & youtube di tabel settings (kalau belum ada).
    Route::get('/fix-settings-columns', function () {
        try {
            $added = [];
            \Illuminate\Support\Facades\Schema::table('settings', function ($table) use (&$added) {
                if (!\Illuminate\Support\Facades\Schema::hasColumn('settings', 'facebook')) {
                    $table->string('facebook')->nullable();
                    $added[] = 'facebook';
                }
                if (!\Illuminate\Support\Facades\Schema::hasColumn('settings', 'youtube')) {
                    $table->string('youtube')->nullable();
                    $added[] = 'youtube';
                }
            });

            return response()->json([
                'status' => 'success',
                'added_columns' => $added,
                'message' => empty($added) ? 'Semua kolom sudah ada' : 'Kolom berhasil ditambahkan: ' . implode(', ', $added)
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // One-shot: buat symlink public/storage -> storage/app/public.
    Route::get('/fix-storage-link', function () {
        try {
            $link = public_path('storage');
            if (is_link($link)) {
                return response()->json(['status' => 'already_exists', 'message' => 'Symlink sudah ada di: ' . $link]);
            }
            \Illuminate\Support\Facades\Artisan::call('storage:link');
            return response()->json([
                'status'  => 'success',
                'message' => 'Symlink berhasil dibuat',
                'output'  => \Illuminate\Support\Facades\Artisan::output()
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });


}
