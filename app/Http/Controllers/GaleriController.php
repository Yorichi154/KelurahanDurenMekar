<?php

namespace App\Http\Controllers;

use App\Models\Galeri;
use Illuminate\Http\Request;

class GaleriController extends Controller
{
    public function index()
    {
        return Galeri::latest()->get();
    }

    public function store(Request $request)
    {
        return Galeri::create($request->all());
    }

    public function show(Galeri $galeri)
    {
        return $galeri;
    }

    public function update(Request $request, Galeri $galeri)
    {
        $galeri->update($request->all());

        return $galeri;
    }

    public function destroy(Galeri $galeri)
    {
        $galeri->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
