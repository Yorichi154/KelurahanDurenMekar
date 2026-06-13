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
        $data = $request->all();
        if ($request->has('image') && $request->image) {
            $data['image'] = $this->saveBase64Image($request->image, 'galeri');
        }
        return Galeri::create($data);
    }

    public function show(Galeri $galeri)
    {
        return $galeri;
    }

    public function update(Request $request, Galeri $galeri)
    {
        $data = $request->all();
        if ($request->has('image') && $request->image) {
            if ($galeri->image && str_starts_with($galeri->image, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $galeri->image);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $data['image'] = $this->saveBase64Image($request->image, 'galeri');
        }
        $galeri->update($data);

        return $galeri;
    }

    public function destroy(Galeri $galeri)
    {
        if ($galeri->image && str_starts_with($galeri->image, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $galeri->image);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
        }
        $galeri->delete();

        return response()->json([
            'success' => true
        ]);
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

