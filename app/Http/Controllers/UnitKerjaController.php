<?php

namespace App\Http\Controllers;

use App\Models\UnitKerja;
use Illuminate\Http\Request;

class UnitKerjaController extends Controller
{
    public function index()
    {
        return UnitKerja::latest()->get();
    }

    public function store(Request $request)
    {
        $item = UnitKerja::create([
            'jenis'              => $request->jenis,
            'nama_unit'          => $request->nama_unit,
            'nama_pimpinan'      => $request->nama_pimpinan,
            'jabatan_pimpinan'   => $request->jabatan_pimpinan,
            'kontak'             => $request->kontak,
            'email'              => $request->email,
            'alamat'             => $request->alamat,
            'tugas'              => $request->tugas,
            'kewenangan'         => $request->kewenangan,
        ]);

        return response()->json($item, 201);
    }

    public function show(UnitKerja $unitKerja)
    {
        return $unitKerja;
    }

    public function update(Request $request, UnitKerja $unitKerja)
    {
        $unitKerja->update([
            'jenis'              => $request->jenis,
            'nama_unit'          => $request->nama_unit,
            'nama_pimpinan'      => $request->nama_pimpinan,
            'jabatan_pimpinan'   => $request->jabatan_pimpinan,
            'kontak'             => $request->kontak,
            'email'              => $request->email,
            'alamat'             => $request->alamat,
            'tugas'              => $request->tugas,
            'kewenangan'         => $request->kewenangan,
        ]);

        return response()->json($unitKerja);
    }

    public function destroy(UnitKerja $unitKerja)
    {
        $unitKerja->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
