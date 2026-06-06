<?php

namespace App\Http\Controllers;

use App\Models\Pelayanan;
use Illuminate\Http\Request;

class PelayananController extends Controller
{
    public function index()
    {
        return Pelayanan::latest()->get();
    }

    public function store(Request $request)
    {
        $item = Pelayanan::create([
            'nama'         => $request->nama,
            'slug'         => $request->slug,
            'estimasi'     => $request->estimasi,
            'biaya'        => $request->biaya,
            'online'       => $request->online,
            'syarat'       => $request->syarat,
            'langkah'      => $request->langkah,
            'form_fields'  => $request->form_fields,
            'jam_pelayanan'=> $request->jam_pelayanan,
            'lokasi'       => $request->lokasi,
            'catatan'      => $request->catatan,
        ]);

        return response()->json($item, 201);
    }

    public function show(Pelayanan $pelayanan)
    {
        return $pelayanan;
    }

    public function update(Request $request, Pelayanan $pelayanan)
    {
        $pelayanan->update([
            'nama'         => $request->nama,
            'slug'         => $request->slug,
            'estimasi'     => $request->estimasi,
            'biaya'        => $request->biaya,
            'online'       => $request->online,
            'syarat'       => $request->syarat,
            'langkah'      => $request->langkah,
            'form_fields'  => $request->form_fields,
            'jam_pelayanan'=> $request->jam_pelayanan,
            'lokasi'       => $request->lokasi,
            'catatan'      => $request->catatan,
            'teks_tombol' => $request->teks_tombol,
        ]);

        return response()->json($pelayanan);
    }

    public function destroy(Pelayanan $pelayanan)
    {
        $pelayanan->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
