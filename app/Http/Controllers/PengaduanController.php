<?php

namespace App\Http\Controllers;

use App\Models\Pengaduan;
use Illuminate\Http\Request;

class PengaduanController extends Controller
{
    public function index()
    {
        return Pengaduan::with('user')
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $pengaduan = Pengaduan::create([
            'user_id' => auth()->id(),
            'judul' => $request->judul,
            'isi' => $request->isi,
            'status' => 'menunggu',
        ]);

        return response()->json($pengaduan, 201);
    }

    public function show(Pengaduan $pengaduan)
    {
        return $pengaduan->load('user');
    }

    public function update(Request $request, Pengaduan $pengaduan)
    {
        $pengaduan->update($request->all());
        return $pengaduan;
    }

    public function destroy(Pengaduan $pengaduan)
    {
        $pengaduan->delete();
        return response()->json(['success' => true]);
    }

    // ==================== WARGA METHODS ====================

    public function indexWarga()
    {
        $pengaduan = Pengaduan::where('user_id', auth()->id())->latest()->get();
        return response()->json($pengaduan);
    }

    public function storeWarga(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'kategori' => 'nullable|string|max:100',
            'lokasi' => 'nullable|string|max:255',
            'lampiran' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $data = [
            'user_id' => auth()->id(),
            'judul' => $request->judul,
            'isi' => $request->isi,
            'kategori' => $request->kategori,
            'lokasi' => $request->lokasi,
            'status' => 'menunggu',
        ];

        if ($request->hasFile('lampiran')) {
            $data['lampiran'] = $request->file('lampiran')->store('pengaduan', 'public');
        }

        $pengaduan = Pengaduan::create($data);

        return response()->json($pengaduan, 201);
    }

    // ==================== STAF METHODS ====================

    public function indexStaf()
    {
        $pengaduan = Pengaduan::with('user')->latest()->get();
        return response()->json($pengaduan);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:menunggu,diproses,selesai,ditolak',
        ]);

        $pengaduan = Pengaduan::findOrFail($id);
        $pengaduan->update(['status' => $request->status]);

        return response()->json($pengaduan);
    }
}
