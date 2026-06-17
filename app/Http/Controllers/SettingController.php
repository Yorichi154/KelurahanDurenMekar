<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    /**
     * Kolom yang diizinkan berdasarkan yang ada di database
     */
    private function getAllowedFields(): array
    {
        $allFields = [
            'site_name', 'email', 'phone', 'address', 'instagram',
            'facebook', 'youtube', 'lurah_name', 'kecamatan', 'kota',
            'provinsi', 'kodepos', 'profil', 'maps', 'jam_pelayanan',
            'visi', 'misi', 'luas_wilayah', 'jumlah_penduduk',
            'jumlah_rt', 'jumlah_rw',
        ];

        // Filter hanya kolom yang benar-benar ada di tabel
        $existingColumns = Schema::getColumnListing('settings');
        return array_intersect($allFields, $existingColumns);
    }

    public function index()
    {
        try {
            $setting = Setting::first();
            if (!$setting) {
                // Buat objek kosong tanpa simpan ke DB
                return response()->json(new Setting());
            }
            return response()->json($setting);
        } catch (\Exception $e) {
            \Log::error('Setting index error: ' . $e->getMessage());
            return response()->json(['error' => 'Gagal memuat setting'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $allowed = $this->getAllowedFields();
            $data = $request->only($allowed);

            $setting = Setting::first();

            if ($setting) {
                $setting->update($data);
                return response()->json($setting);
            }

            $setting = Setting::create($data);
            return response()->json($setting, 201);
        } catch (\Exception $e) {
            \Log::error('Setting store error: ' . $e->getMessage());
            return response()->json(['error' => 'Gagal menyimpan setting: ' . $e->getMessage()], 500);
        }
    }

    public function show(Setting $setting)
    {
        return response()->json($setting);
    }

    public function update(Request $request, Setting $setting)
    {
        try {
            $allowed = $this->getAllowedFields();
            $data = $request->only($allowed);

            $setting->update($data);
            return response()->json($setting);
        } catch (\Exception $e) {
            \Log::error('Setting update error: ' . $e->getMessage());
            return response()->json(['error' => 'Gagal mengupdate setting: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Setting $setting)
    {
        $setting->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
