<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SuratController;
use App\Http\Controllers\PengaduanController;
use App\Http\Controllers\WargaDashboardController;
use App\Http\Controllers\StafDashboardController;
use App\Http\Controllers\PelayananController;
use App\Http\Controllers\BeritaController;
use App\Http\Controllers\PengumumanController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\AgendaController;
use App\Http\Controllers\GaleriController;
use App\Http\Controllers\LembagaController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\RtrwController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UnitKerjaController;
use App\Http\Controllers\BuatSuratController;
use App\Http\Controllers\StrukturOrganisasiController;
use App\Http\Controllers\PengaduanChatController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MasterPenandatanganController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
Route::get('/test-auth', function () {
    return response()->json([
        'logged_in' => auth()->check(),
        'user' => auth()->user(),
    ]);

})->middleware('auth');

/*
|--------------------------------------------------------------------------
| PUBLIC API
|--------------------------------------------------------------------------
*/

Route::get('/public/berita', [BeritaController::class, 'index']);

Route::get('/public/agenda', [AgendaController::class, 'index']);

Route::get('/public/pengumuman', [PengumumanController::class, 'index']);

Route::get('/public/lembaga', [LembagaController::class, 'index']);
Route::get('/public/unit-kerja', [UnitKerjaController::class, 'index']);
Route::get('/public/pelayanan', [PelayananController::class, 'index']);
Route::get('/public/setting', [SettingController::class, 'index']);
Route::get('/public/faq', [FaqController::class, 'index']);
Route::get('/public/rtrw', [RtrwController::class, 'index']);
Route::get('/public/galeri', [GaleriController::class, 'index']);
Route::get('/public/struktur-organisasi', [StrukturOrganisasiController::class, 'index']);

Route::get('/public/stats', function () {
    $setting = \App\Models\Setting::first();
    $totalRtrw = '0';
    if ($setting) {
        $rt = $setting->jumlah_rt ?? '0';
        $rw = $setting->jumlah_rw ?? '0';
        $totalRtrw = $rt . ' / ' . $rw;
    } else {
        $totalRtrw = (string)\App\Models\Rtrw::count();
    }

    return response()->json([
        'total_warga' => \App\Models\User::where('role', 'warga')->count(),
        'total_rtrw' => $totalRtrw,
        'layanan_aktif' => \App\Models\Pelayanan::count(),
        'surat_diproses' => \App\Models\Surat::where('status', 'diproses')->count(),
    ]);
});
// ==================== AUTHENTICATED API ====================
Route::middleware(['auth'])->group(function () {

    // Get current user
    Route::get('/user', function () {
        return response()->json([
            'id' => auth()->id(),
            'name' => auth()->user()->name,
            'email' => auth()->user()->email,
            'role' => auth()->user()->role,
        ]);
    });

    // Standalone Chat API
    Route::post('/chat/room', [ChatController::class, 'getOrCreateRoom']);
    Route::get('/chat/room/{roomId}/messages', [ChatController::class, 'getMessages']);
    Route::post('/chat/room/{roomId}/messages', [ChatController::class, 'sendMessage']);

    // ==================== ADMIN API ====================
Route::prefix('admin')->middleware(['role:admin'])->group(function () {

    Route::apiResource('users', UserManagementController::class);

    Route::apiResource('surat', SuratController::class);
    Route::post('surat/{id}/restore', [SuratController::class, 'restore']);
    Route::delete('surat/{id}/force', [SuratController::class, 'forceDelete']);

    Route::apiResource('berita', BeritaController::class);

    Route::apiResource('pengaduan', PengaduanController::class);

    Route::apiResource('pengumuman', PengumumanController::class);

    Route::apiResource('agenda', AgendaController::class);

    Route::apiResource('galeri', GaleriController::class);

    Route::apiResource('lembaga', LembagaController::class);

    Route::apiResource('faq', FaqController::class);

    Route::apiResource('rtrw', RtrwController::class);

    Route::apiResource('setting', SettingController::class);

    Route::apiResource('pelayanan', PelayananController::class);
    Route::apiResource('master-penandatangan', MasterPenandatanganController::class);

    Route::apiResource('unit-kerja', UnitKerjaController::class);

    Route::apiResource('struktur-organisasi', StrukturOrganisasiController::class);

    Route::get('/laporan', [LaporanController::class, 'index']);
    Route::get('/laporan/export/csv', [LaporanController::class, 'exportCsv']);
    Route::get('/laporan/export/pdf', [LaporanController::class, 'exportPdf']);
    Route::get('/laporan/export/docx', [LaporanController::class, 'exportDocx']);

    Route::post(
        'surat/{surat}/upload',
        [SuratController::class, 'uploadPdf']
    );

   Route::get('/stats', function () {
    return response()->json([
        'berita' => \App\Models\Berita::count(),
        'agenda' => \App\Models\Agenda::count(),
        'galeri' => \App\Models\Galeri::count(),
        'pengumuman' => \App\Models\Pengumuman::count(),
        'surat' => \App\Models\Surat::count(),
        'pengaduan' => \App\Models\Pengaduan::count(),
        'warga' => \App\Models\User::where('role','warga')->count(),
    ]);
});

});

    // ==================== WARGA API ====================
    Route::prefix('warga')->middleware(['role:warga'])->group(function () {
        Route::get('/dashboard', [WargaDashboardController::class, 'index']);
        Route::get('/surat', [SuratController::class, 'indexWarga']);
        Route::post('/surat', [SuratController::class, 'storeWarga']);
        Route::get('/pengaduan', [PengaduanController::class, 'indexWarga']);
        Route::post('/pengaduan', [PengaduanController::class, 'storeWarga']);
        Route::get('/pelayanan', [PelayananController::class, 'indexWarga']);
        Route::get('/profil', [ProfileController::class, 'showApi']);
        Route::put('/profil', [ProfileController::class, 'updateApi']);
        Route::get('/pengaduan/{id}/chats', [PengaduanChatController::class, 'getChatsWarga']);
        Route::post('/pengaduan/{id}/chats', [PengaduanChatController::class, 'sendChatWarga']);
        Route::get('/chat/staff', [ChatController::class, 'getStaffList']);
    });

    // ==================== STAF API ====================
    Route::prefix('staf')->middleware(['role:staf'])->group(function () {
        Route::get('/dashboard', [StafDashboardController::class, 'index']);
        Route::get('/pengaduan', [PengaduanController::class, 'indexStaf']);
        Route::put('/pengaduan/{id}/status', [PengaduanController::class, 'updateStatus']);
        Route::get('/pengaduan/{id}', [PengaduanController::class, 'show']);
        Route::get('/surat', [SuratController::class, 'indexStaf']);
        Route::get('/surat/{surat}', [SuratController::class, 'show']);
        Route::put('/surat/{id}/status', [SuratController::class, 'updateStatus']);
        Route::post('/surat/{id}/upload-hasil', [SuratController::class, 'uploadHasil']);
        Route::delete('/surat/{surat}', [SuratController::class, 'destroy']);
        Route::get('/profil', [ProfileController::class, 'showApi']);
        Route::put('/profil', [ProfileController::class, 'updateApi']);
        Route::apiResource('pengumuman', \App\Http\Controllers\PengumumanController::class);

        // ── SiSurat: Pembuatan & Arsip Surat ──
        Route::get('/buat-surat/penandatangan', [MasterPenandatanganController::class, 'indexActive']);
        Route::get('/buat-surat/warga', [BuatSuratController::class, 'searchWarga']);
        Route::get('/buat-surat/jenis', [BuatSuratController::class, 'indexJenis']);
        Route::post('/buat-surat/preview', [BuatSuratController::class, 'preview']);
        Route::post('/buat-surat', [BuatSuratController::class, 'store']);
        Route::get('/buat-surat/{id}/download', [BuatSuratController::class, 'download']);
        Route::get('/arsip-surat', [BuatSuratController::class, 'indexArsip']);
        Route::get('/pengaduan/{id}/chats', [PengaduanChatController::class, 'getChatsStaf']);
        Route::post('/pengaduan/{id}/chats', [PengaduanChatController::class, 'sendChatStaf']);
        Route::get('/chat/warga', [ChatController::class, 'getWargaList']);
    });
});
