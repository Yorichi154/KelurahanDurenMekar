<?php

namespace App\Http\Controllers;

use App\Models\Surat;
use App\Models\Pengaduan;

class StafDashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_surat' => Surat::count(),
            'surat_menunggu' => Surat::where('status', 'menunggu')->count(),
            'total_pengaduan' => Pengaduan::count(),
            'pengaduan_diproses' => Pengaduan::where('status', 'diproses')->count(),
            'pengaduan_aktif' => Pengaduan::whereIn('status', ['menunggu', 'diproses'])->count(),
            'total_pengajuan' => Surat::count() + Pengaduan::count(),
            'surat_terbaru' => Surat::with('user')->latest()->take(5)->get(),
            'pengaduan_terbaru' => Pengaduan::with('user')->latest()->take(5)->get(),
        ]);
    }
}
