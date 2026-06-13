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
        $data = [
            'jenis'              => $request->jenis,
            'nama_unit'          => $request->nama_unit,
            'nama_pimpinan'      => $request->nama_pimpinan,
            'jabatan_pimpinan'   => $request->jabatan_pimpinan,
            'nip_pimpinan'       => $request->nip_pimpinan,
            'pendidikan_pimpinan'=> $request->pendidikan_pimpinan,
            'kontak'             => $request->kontak,
            'email'              => $request->email,
            'alamat'             => $request->alamat,
            'tugas'              => $request->tugas,
            'kewenangan'         => $request->kewenangan,
            'riwayat_jabatan'    => $request->riwayat_jabatan,
        ];

        if ($request->has('tim_pegawai')) {
            $data['tim_pegawai'] = is_string($request->tim_pegawai)
                ? json_decode($request->tim_pegawai, true)
                : $request->tim_pegawai;
        }

        if ($request->hasFile('foto_pimpinan')) {
            $data['foto_pimpinan'] = $request->file('foto_pimpinan')->store('unit-kerja', 'public');
        }

        $item = UnitKerja::create($data);

        return response()->json($item, 201);
    }

    public function show(UnitKerja $unitKerja)
    {
        return $unitKerja;
    }

    public function update(Request $request, UnitKerja $unitKerja)
    {
        $data = [
            'jenis'              => $request->jenis,
            'nama_unit'          => $request->nama_unit,
            'nama_pimpinan'      => $request->nama_pimpinan,
            'jabatan_pimpinan'   => $request->jabatan_pimpinan,
            'nip_pimpinan'       => $request->nip_pimpinan,
            'pendidikan_pimpinan'=> $request->pendidikan_pimpinan,
            'kontak'             => $request->kontak,
            'email'              => $request->email,
            'alamat'             => $request->alamat,
            'tugas'              => $request->tugas,
            'kewenangan'         => $request->kewenangan,
            'riwayat_jabatan'    => $request->riwayat_jabatan,
        ];

        if ($request->has('tim_pegawai')) {
            $data['tim_pegawai'] = is_string($request->tim_pegawai)
                ? json_decode($request->tim_pegawai, true)
                : $request->tim_pegawai;
        }

        if ($request->hasFile('foto_pimpinan')) {
            if ($unitKerja->foto_pimpinan) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($unitKerja->foto_pimpinan);
            }
            $data['foto_pimpinan'] = $request->file('foto_pimpinan')->store('unit-kerja', 'public');
        }

        $unitKerja->update($data);

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
