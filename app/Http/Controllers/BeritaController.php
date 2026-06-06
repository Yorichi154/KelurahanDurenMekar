<?php

namespace App\Http\Controllers;

use App\Models\Berita;
use Illuminate\Http\Request;

class BeritaController extends Controller
{
    public function index()
    {
        return response()->json(
            Berita::latest()->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'     => 'required|max:255',
            'category'  => 'required|max:100',
            'date'      => 'required',
            'excerpt'   => 'nullable',
            'content'   => 'required',
            'status'    => 'required',
            'image'     => 'nullable'
        ]);

        $berita = Berita::create($validated);

        return response()->json($berita, 201);
    }

    public function show(Berita $berita)
    {
        return response()->json($berita);
    }

    public function update(Request $request, Berita $berita)
    {
        $validated = $request->validate([
            'title'     => 'required|max:255',
            'category'  => 'required|max:100',
            'date'      => 'required',
            'excerpt'   => 'nullable',
            'content'   => 'required',
            'status'    => 'required',
            'image'     => 'nullable'
        ]);

        $berita->update($validated);

        return response()->json($berita);
    }

    public function destroy(Berita $berita)
    {
        $berita->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
