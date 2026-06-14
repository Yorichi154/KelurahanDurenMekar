<?php

namespace App\Http\Controllers;

use App\Models\Surat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SuratController extends Controller
{
    // ==================== ADMIN METHODS ====================

    public function index(Request $request)
    {
        $this->checkMigration();
        $query = Surat::with(['user', 'pickup']);
        if ($request->query('trashed') === 'true') {
            $query->onlyTrashed();
        }
        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        $surat = Surat::create([
            'user_id' => $request->user_id,
            'jenis_surat' => $request->jenis_surat,
            'keperluan' => $request->keperluan,
            'status' => 'menunggu',
        ]);

        return response()->json($surat, 201);
    }

    public function show(Surat $surat)
    {
        return $surat->load(['user', 'pickup']);
    }

    public function update(Request $request, Surat $surat)
    {
        $surat->update([
            'status' => $request->status,
            'catatan_staf' => $request->catatan_staf ?? $request->catatan,
        ]);

        return response()->json($surat);
    }

    public function destroy(Surat $surat)
    {
        // For soft delete, we do NOT delete files from disk so they can be restored later.
        $surat->delete();
        return response()->json(['message' => 'Surat berhasil dihapus (soft delete)', 'success' => true]);
    }

    public function restore($id)
    {
        $surat = Surat::onlyTrashed()->findOrFail($id);
        $surat->restore();
        return response()->json(['message' => 'Surat berhasil dipulihkan', 'success' => true]);
    }

    public function forceDelete($id)
    {
        $surat = Surat::withTrashed()->findOrFail($id);
        
        // Delete physical files on force delete
        if ($surat->berkas) {
            if (is_array($surat->berkas)) {
                foreach ($surat->berkas as $file) {
                    if (is_string($file) && \Illuminate\Support\Facades\Storage::disk('public')->exists($file)) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete($file);
                    }
                }
            } elseif (is_string($surat->berkas) && \Illuminate\Support\Facades\Storage::disk('public')->exists($surat->berkas)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($surat->berkas);
            }
        }

        if ($surat->file_surat && is_string($surat->file_surat) && \Illuminate\Support\Facades\Storage::disk('public')->exists($surat->file_surat)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($surat->file_surat);
        }

        $surat->forceDelete();
        return response()->json(['message' => 'Surat berhasil dihapus permanen beserta berkasnya', 'success' => true]);
    }

    // ==================== WARGA METHODS ====================

    public function indexWarga()
    {
        $surat = Surat::with('pickup')->where('user_id', auth()->id())->latest()->get();
        return response()->json($surat);
    }

    public function storeWarga(Request $request)
    {
        $request->validate([
            'jenis_surat' => 'required|string|max:255',
            'keperluan' => 'required|string',
            'berkas' => 'nullable|array',
            'data_surat' => 'nullable|array',
        ]);

        $surat = Surat::create([
            'user_id' => auth()->id(),
            'jenis_surat' => $request->jenis_surat,
            'keperluan' => $request->keperluan,
            'status' => 'menunggu',
            'berkas' => $request->berkas,
            'data_surat' => $request->data_surat,
        ]);

        return response()->json($surat, 201);
    }

    // ==================== STAF METHODS ====================

    public function indexStaf()
    {
        $this->checkMigration();
        $surat = Surat::with(['user', 'pickup'])->latest()->get();
        return response()->json($surat);
    }

    private function checkMigration()
    {
        if (!\Illuminate\Support\Facades\Schema::hasColumn('surats', 'berkas')) {
            try {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            } catch (\Exception $e) {
                // Silently ignore
            }
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:menunggu,diproses,selesai,ditolak',
        ]);

        $surat = Surat::findOrFail($id);
        $surat->update(['status' => $request->status]);

        return response()->json($surat);
    }

    public function uploadHasil(Request $request, $id)
    {
        $request->validate([
            'file_surat' => 'required|file|mimes:pdf|max:5120',
        ]);

        $surat = Surat::findOrFail($id);
        $path = $request->file('file_surat')->store('surat_hasil', 'public');
        $surat->update([
            'file_surat' => $path,
            'status'     => 'selesai',
        ]);

        return response()->json(['message' => 'Surat berhasil dikirim ke warga', 'path' => $path]);
    }
}
