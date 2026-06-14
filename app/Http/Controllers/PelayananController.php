<?php

namespace App\Http\Controllers;

use App\Models\Pelayanan;
use Illuminate\Http\Request;

class PelayananController extends Controller
{
    public function index()
    {
        return Pelayanan::with('template')->latest()->get();
    }

    public function store(Request $request)
    {
        $item = Pelayanan::create([
            'nama'             => $request->nama,
            'slug'             => $request->slug,
            'estimasi'         => $request->estimasi,
            'biaya'            => $request->biaya,
            'online'           => $request->online,
            'syarat'           => $request->syarat,
            'langkah'          => $request->langkah,
            'form_fields'      => $request->form_fields,
            'jam_pelayanan'    => $request->jam_pelayanan,
            'lokasi'           => $request->lokasi,
            'catatan'          => $request->catatan,
            'teks_tombol'      => $request->teks_tombol,
            'metode_pengajuan' => $request->metode_pengajuan ?? ($request->online ? 'online' : 'offline'),
            'metode_hasil'     => $request->metode_hasil ?? 'download',
            'status'           => $request->status ?? 'aktif',
        ]);

        if ($request->filled('template_html')) {
            $item->template()->create([
                'konten_html' => $request->template_html,
                'versi'       => 1,
            ]);
        }

        return response()->json($item->load('template'), 201);
    }

    public function show(Pelayanan $pelayanan)
    {
        return $pelayanan->load('template');
    }

    public function update(Request $request, Pelayanan $pelayanan)
    {
        $pelayanan->update([
            'nama'             => $request->nama,
            'slug'             => $request->slug,
            'estimasi'         => $request->estimasi,
            'biaya'            => $request->biaya,
            'online'           => $request->online,
            'syarat'           => $request->syarat,
            'langkah'          => $request->langkah,
            'form_fields'      => $request->form_fields,
            'jam_pelayanan'    => $request->jam_pelayanan,
            'lokasi'           => $request->lokasi,
            'catatan'          => $request->catatan,
            'teks_tombol'      => $request->teks_tombol,
            'metode_pengajuan' => $request->metode_pengajuan ?? ($request->online ? 'online' : 'offline'),
            'metode_hasil'     => $request->metode_hasil ?? 'download',
            'status'           => $request->status ?? 'aktif',
        ]);

        if ($request->has('template_html')) {
            $pelayanan->template()->updateOrCreate(
                [],
                [
                    'konten_html' => $request->template_html,
                    'versi'       => ($pelayanan->template->versi ?? 0) + 1,
                ]
            );
        }

        return response()->json($pelayanan->load('template'));
    }

    public function destroy(Pelayanan $pelayanan)
    {
        $pelayanan->delete();

        return response()->json([
            'success' => true
        ]);
    }

    public function indexWarga()
    {
        return Pelayanan::with('template')->where('status', 'aktif')->latest()->get();
    }
}
