<?php

namespace App\Http\Controllers;

use App\Models\StrukturOrganisasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StrukturOrganisasiController extends Controller
{
    public function index()
    {
        return StrukturOrganisasi::orderBy('urutan')->orderBy('id')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama'     => 'required|string|max:255',
            'jabatan'  => 'required|string|max:255',
            'foto'     => 'nullable|image|max:2048',
            'urutan'   => 'nullable|integer',
            'parent_jabatan' => 'nullable|string|max:255',
        ]);

        $data = $request->only(['nama', 'jabatan', 'urutan', 'parent_jabatan', 'aktif']);
        $data['aktif'] = $request->boolean('aktif', true);

        if ($request->hasFile('foto')) {
            $data['foto'] = $request->file('foto')->store('struktur', 'public');
        }

        $item = StrukturOrganisasi::create($data);
        return response()->json($item, 201);
    }

    public function show(StrukturOrganisasi $strukturOrganisasi)
    {
        return $strukturOrganisasi;
    }

    public function update(Request $request, $id)
    {
        $item = StrukturOrganisasi::findOrFail($id);

        $request->validate([
            'nama'     => 'sometimes|string|max:255',
            'jabatan'  => 'sometimes|string|max:255',
            'foto'     => 'nullable|image|max:2048',
            'urutan'   => 'nullable|integer',
            'parent_jabatan' => 'nullable|string|max:255',
        ]);

        $data = $request->only(['nama', 'jabatan', 'urutan', 'parent_jabatan']);
        if ($request->has('aktif')) {
            $data['aktif'] = $request->boolean('aktif');
        }

        if ($request->hasFile('foto')) {
            // Delete old photo
            if ($item->foto) {
                Storage::disk('public')->delete($item->foto);
            }
            $data['foto'] = $request->file('foto')->store('struktur', 'public');
        }

        $item->update($data);
        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = StrukturOrganisasi::findOrFail($id);
        if ($item->foto) {
            Storage::disk('public')->delete($item->foto);
        }
        $item->delete();
        return response()->json(['success' => true, 'message' => 'Anggota berhasil dihapus']);
    }
}
