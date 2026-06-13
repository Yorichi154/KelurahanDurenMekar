<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class NewPasswordController extends Controller
{
    /**
     * Display the password reset view.
     */
    public function create(Request $request): \Illuminate\View\View
    {
        return view('layouts.public');
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'token' => ['required'], // token here represents the OTP code
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Find OTP record
        $otpRecord = \App\Models\PasswordResetOtp::where('email', $request->email)
            ->where('otp', $request->token)
            ->first();

        if (!$otpRecord || now()->greaterThan($otpRecord->expires_at)) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa.'
                ], 422);
            }
            return back()->withErrors(['email' => 'Kode OTP tidak valid atau sudah kedaluwarsa.']);
        }

        $user = \App\Models\User::where('email', $request->email)->first();
        if (!$user) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Alamat email tidak ditemukan.'
                ], 422);
            }
            return back()->withErrors(['email' => 'Alamat email tidak ditemukan.']);
        }

        // Reset password
        $user->forceFill([
            'password' => Hash::make($request->password),
            'remember_token' => Str::random(60),
        ])->save();

        event(new PasswordReset($user));

        // Delete the OTP record after successful verification
        $otpRecord->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Password berhasil diperbarui.'
            ]);
        }

        return redirect()->route('login')->with('status', 'Password berhasil diperbarui.');
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $otpRecord = \App\Models\PasswordResetOtp::where('email', $request->email)
            ->where('otp', $request->otp)
            ->first();

        if (!$otpRecord || now()->greaterThan($otpRecord->expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa.'
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP valid.'
        ]);
    }
}
