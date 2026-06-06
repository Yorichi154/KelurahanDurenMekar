<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
  public function index()
{
    return User::select(
        'id',
        'name',
        'email',
        'role',
        'status',
        'telp',
        'rt',
        'rw',
        'email_verified_at',
        'created_at'
    )
    ->latest()
    ->get();
}
    public function show(User $user)
    {
        return [
            'id'      => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
            'role'    => $user->role,
            'status' => $user->status,
            'telp'    => $user->telp,
            'alamat'  => $user->alamat,
            'rt'      => $user->rt,
            'rw'      => $user->rw,
        ];
    }

public function update(Request $request, User $user)
{
    $request->validate([

        'name' =>
            'required|string|max:255',

        'email' =>
            'required|email',

        'role' =>
            'required|in:admin,staf,warga',

        'status' =>
            'required|in:aktif,nonaktif',
    ]);

    $user->update([

        'name'   => $request->name,
        'email'  => $request->email,
        'role'   => $request->role,
        'status' => $request->status,

        'telp'   => $request->telp,
        'alamat' => $request->alamat,

        'rt'     => $request->rt,
        'rw'     => $request->rw,
    ]);

    return response()->json($user);
}
    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Tidak dapat menghapus akun sendiri'
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
