<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use App\Models\Berita;
use App\Models\Faq;
use App\Models\Galeri;
use App\Models\Lembaga;
use App\Models\Pelayanan;
use App\Models\Pengaduan;
use App\Models\Pengumuman;
use App\Models\Rtrw;
use App\Models\Surat;
use App\Models\UnitKerja;
use App\Models\User;
class LaporanController extends Controller
{
   public function index()
{
    return response()->json([

        'berita'      => Berita::count(),
        'agenda'      => Agenda::count(),
        'pengumuman'  => Pengumuman::count(),
        'galeri'      => Galeri::count(),

        'surat'       => Surat::count(),
        'pengaduan'   => Pengaduan::count(),

        'rtrw'        => Rtrw::count(),
        'faq'         => Faq::count(),

        'lembaga'     => Lembaga::count(),
        'unit_kerja'  => UnitKerja::count(),
        'pelayanan'   => Pelayanan::count(),

        'user'        => User::count(),

        'surat_status' =>
            Surat::selectRaw(
                'status, COUNT(*) total'
            )
            ->groupBy('status')
            ->get(),

        'pengaduan_status' =>
            Pengaduan::selectRaw(
                'status, COUNT(*) total'
            )
            ->groupBy('status')
            ->get(),
    ]);
}
}
