<?php

namespace App\Http\Controllers;

use App\Models\MasterPenandatangan;
use Illuminate\Http\Request;

class MasterPenandatanganController extends Controller
{
    public function index()
    {
        return MasterPenandatangan::latest()->get();
    }

    public function indexActive()
    {
        return MasterPenandatangan::where('status_aktif', true)->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'jabatan' => 'required|string|max:255',
            'nip' => 'required|string|max:255',
            'status_aktif' => 'boolean',
        ]);

        $item = MasterPenandatangan::create([
            'nama' => $request->nama,
            'jabatan' => $request->jabatan,
            'nip' => $request->nip,
            'status_aktif' => $request->has('status_aktif') ? (bool)$request->status_aktif : true,
        ]);

        return response()->json($item, 201);
    }

    public function show($id)
    {
        return MasterPenandatangan::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'jabatan' => 'required|string|max:255',
            'nip' => 'required|string|max:255',
            'status_aktif' => 'boolean',
        ]);

        $item = MasterPenandatangan::findOrFail($id);
        $item->update([
            'nama' => $request->nama,
            'jabatan' => $request->jabatan,
            'nip' => $request->nip,
            'status_aktif' => $request->has('status_aktif') ? (bool)$request->status_aktif : true,
        ]);

        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = MasterPenandatangan::findOrFail($id);
        $item->delete();

        return response()->json(['success' => true]);
    }
}
