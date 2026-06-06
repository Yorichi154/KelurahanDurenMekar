<?php

namespace App\Http\Controllers;

use App\Models\Surat;
use App\Models\Pengaduan;

class WargaDashboardController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        return response()->json([
            'surat_menunggu' => Surat::where('user_id', $userId)->where('status', 'menunggu')->count(),
            'surat_diproses' => Surat::where('user_id', $userId)->where('status', 'diproses')->count(),
            'surat_selesai' => Surat::where('user_id', $userId)->where('status', 'selesai')->count(),
            'pengaduan_aktif' => Pengaduan::where('user_id', $userId)->whereIn('status', ['menunggu', 'diproses'])->count(),
            'surat_terbaru' => Surat::where('user_id', $userId)->latest()->take(5)->get(),
            'pengaduan_terbaru' => Pengaduan::where('user_id', $userId)->latest()->take(5)->get(),
        ]);
    }
}
