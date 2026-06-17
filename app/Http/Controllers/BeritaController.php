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

        if (isset($validated['image']) && $validated['image']) {
            $validated['image'] = $this->saveBase64Image($validated['image'], 'berita');
        }

        $berita = Berita::create($validated);

        return response()->json($berita, 201);
    }

    public function show(Berita $beritum)
    {
        return response()->json($beritum);
    }

    public function update(Request $request, Berita $beritum)
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

        if (isset($validated['image']) && $validated['image']) {
            // Delete old image if it is stored in our filesystem
            if ($beritum->image && str_starts_with($beritum->image, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $beritum->image);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $validated['image'] = $this->saveBase64Image($validated['image'], 'berita');
        }

        $beritum->update($validated);

        return response()->json($beritum);
    }

 public function destroy(Berita $berita)
{
    if ($berita->image && str_starts_with($berita->image, '/storage/')) {
        $oldPath = str_replace('/storage/', '', $berita->image);
        \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
    }
    $berita->delete();

    return response()->json(['success' => true]);
}
    private function saveBase64Image($base64String, $folder = 'uploads')
    {
        if (preg_match('/^data:([\w\-\+]+)\/([\w\-\+]+);base64,/', $base64String, $matches)) {
            $mainType = strtolower($matches[1]);
            $subType = strtolower($matches[2]);

            $allowedImages = ['jpg', 'jpeg', 'gif', 'png', 'webp', 'x-png', 'pjpeg', 'svg', 'svg+xml'];
            $isPdf = ($mainType === 'application' && $subType === 'pdf');
            $isImage = ($mainType === 'image' && in_array($subType, $allowedImages));

            if (!$isImage && !$isPdf) {
                throw new \Exception('Format berkas tidak valid. Gunakan gambar (JPG, PNG, GIF, WEBP) atau PDF.');
            }

            $data = substr($base64String, strpos($base64String, ',') + 1);
            $data = str_replace(' ', '+', $data);
            $data = base64_decode($data);

            if ($data === false) {
                throw new \Exception('Gagal melakukan decode data base64.');
            }

            $ext = $subType;
            if ($ext === 'jpeg' || $ext === 'pjpeg') $ext = 'jpg';
            if ($ext === 'x-png') $ext = 'png';
            if ($ext === 'svg+xml') $ext = 'svg';

            $fileName = uniqid() . '.' . $ext;
            $filePath = $folder . '/' . $fileName;

            \Illuminate\Support\Facades\Storage::disk('public')->put($filePath, $data);

            return '/storage/' . $filePath;
        }

        return $base64String;
    }
}

