<?php

namespace App\Http\Controllers;

use App\Models\Rtrw;
use Illuminate\Http\Request;

class RtrwController extends Controller
{
    public function index()
    {
        return Rtrw::latest()->get();
    }

    public function store(Request $request)
    {
        $rtrw = Rtrw::create([
            'rt'       => $request->rt,
            'rw'       => $request->rw,
            'ketua'    => $request->ketua,
            'alamat'   => $request->alamat,
            'telepon'  => $request->telepon,
        ]);

        return response()->json($rtrw, 201);
    }

    public function show(Rtrw $rtrw)
    {
        return $rtrw;
    }

    public function update(Request $request, Rtrw $rtrw)
    {
        $rtrw->update([
            'rt'       => $request->rt,
            'rw'       => $request->rw,
            'ketua'    => $request->ketua,
            'alamat'   => $request->alamat,
            'telepon'  => $request->telepon,
        ]);

        return response()->json($rtrw);
    }

    public function destroy(Rtrw $rtrw)
    {
        $rtrw->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
