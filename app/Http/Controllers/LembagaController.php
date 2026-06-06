<?php

namespace App\Http\Controllers;

use App\Models\Lembaga;
use Illuminate\Http\Request;

class LembagaController extends Controller
{
    public function index()
    {
        return Lembaga::latest()->get();
    }

    public function store(Request $request)
    {
        $item = Lembaga::create([
            'jenis'      => $request->jenis,
            'nama'       => $request->nama,
            'jabatan'    => $request->jabatan,
            'wilayah'    => $request->wilayah,
            'kontak'     => $request->kontak,
            'keterangan' => $request->keterangan,
        ]);

        return response()->json($item, 201);
    }

    public function show(Lembaga $lembaga)
    {
        return $lembaga;
    }

    public function update(Request $request, Lembaga $lembaga)
    {
        $lembaga->update([
            'jenis'      => $request->jenis,
            'nama'       => $request->nama,
            'jabatan'    => $request->jabatan,
            'wilayah'    => $request->wilayah,
            'kontak'     => $request->kontak,
            'keterangan' => $request->keterangan,
        ]);

        return response()->json($lembaga);
    }

    public function destroy(Lembaga $lembaga)
    {
        $lembaga->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
