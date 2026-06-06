<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form (WEB - Blade)
     */
    public function edit(Request $request): View
    {
        return view('profile.edit', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information (WEB - Blade)
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account (WEB - Blade)
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    // ==================== API METHODS UNTUK SPA ====================

// ==================== API METHODS ====================

public function showApi(Request $request)
{
    $user = $request->user();

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'nik' => $user->nik ?? '',
        'telp' => $user->telp ?? '',
        'rt' => $user->rt ?? '',
        'rw' => $user->rw ?? '',
        'alamat' => $user->alamat ?? '',
        'role' => $user->role,
    ]);
}

public function updateApi(Request $request)
{
    $user = $request->user();

    $validated = $request->validate([
        'name' => 'sometimes|string|max:255',
        'nik' => 'sometimes|string|max:20',
        'telp' => 'sometimes|string|max:20',
        'rt' => 'sometimes|string|max:10',
        'rw' => 'sometimes|string|max:10',
        'alamat' => 'sometimes|string',
    ]);

    $user->update($validated);

    return response()->json([
        'message' => 'Profil berhasil diperbarui',
        'user' => $user
    ]);
}
}
