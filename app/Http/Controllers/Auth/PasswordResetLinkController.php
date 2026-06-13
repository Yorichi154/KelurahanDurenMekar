<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\View\View;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): View
    {
        return view('auth.forgot-password');
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();
        if (!$user) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Alamat email tidak terdaftar.'
                ], 422);
            }
            return back()->withErrors(['email' => 'Alamat email tidak terdaftar.']);
        }

        // Generate 6-digit OTP code
        $otp = sprintf("%06d", mt_rand(100000, 999999));

        // Save OTP
        \App\Models\PasswordResetOtp::updateOrCreate(
            ['email' => $request->email],
            [
                'otp' => $otp,
                'expires_at' => now()->addMinutes(15),
            ]
        );

        // Send OTP email
        try {
            \Illuminate\Support\Facades\Mail::to($request->email)->send(new \App\Mail\SendOtpMail($otp));
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengirim email OTP: ' . $e->getMessage()
                ], 500);
            }
            return back()->withErrors(['email' => 'Gagal mengirim email OTP. Silakan coba lagi nanti.']);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Kode OTP telah dikirim ke email Anda.'
            ]);
        }

        return back()->with('status', 'Kode OTP telah dikirim ke email Anda.');
    }
}
