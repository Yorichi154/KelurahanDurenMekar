<?php

namespace App\Http\Controllers;

use App\Models\Pengumuman;
use Illuminate\Http\Request;

class PengumumanController extends Controller
{
    public function index(Request $request)
    {
        return Pengumuman::latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'     => 'required|string|max:255',
            'kategori'  => 'nullable|string|max:100',
            'ringkasan' => 'nullable|string',
            'date'      => 'required|date',
            'status'    => 'required|string',
            'content'   => 'required|string',
        ]);

        if (empty($validated['kategori'])) {
            $validated['kategori'] = $validated['status'];
        }

        $pengumuman = Pengumuman::create($validated);
        return response()->json($pengumuman, 201);
    }

    public function show(Pengumuman $pengumuman)
    {
        return $pengumuman;
    }

    public function update(Request $request, Pengumuman $pengumuman)
    {
        $validated = $request->validate([
            'title'     => 'required|string|max:255',
            'kategori'  => 'nullable|string|max:100',
            'ringkasan' => 'nullable|string',
            'date'      => 'required|date',
            'status'    => 'required|string',
            'content'   => 'required|string',
        ]);

        if (empty($validated['kategori'])) {
            $validated['kategori'] = $validated['status'];
        }

        $pengumuman->update($validated);

        return response()->json($pengumuman);
    }

    public function destroy(Pengumuman $pengumuman)
    {
        $pengumuman->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
