<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\SendEmailVerificationOtpMail;
use App\Models\EmailVerificationOtp;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use App\Rules\ValidNikIndonesia;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): View
    {
        return view('auth.register');
    }

    /**
     * Handle an incoming registration request.
     *
     * Setelah warga daftar, akun dibuat tetapi belum langsung login.
     * Sistem mengirim OTP ke email, lalu warga harus verifikasi OTP terlebih dahulu.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'nik' => ['required', 'string', 'size:16', 'unique:users,nik', new ValidNikIndonesia],
            'telp' => ['required', 'string', 'max:20'],
            'alamat' => ['required', 'string'],
            'rt' => ['required', 'string', 'max:10'],
            'rw' => ['required', 'string', 'max:10'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => strtolower($request->email),
            'nik' => $request->nik,
            'telp' => $request->telp,
            'alamat' => $request->alamat,
            'rt' => $request->rt,
            'rw' => $request->rw,
            'role' => 'warga',
            'status' => 'aktif',
            'email_verified_at' => null,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        try {
            $this->sendRegistrationOtp($user);
        } catch (\Throwable $e) {
            $user->delete();

            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akun belum dibuat karena email OTP gagal dikirim: ' . $e->getMessage(),
                ], 500);
            }

            return back()->withErrors(['email' => 'Email OTP gagal dikirim. Silakan coba lagi.']);
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'requires_otp' => true,
                'message' => 'Registrasi berhasil. Kode OTP telah dikirim ke email Anda.',
                'email' => $user->email,
            ], 201);
        }

        return redirect('/#verify-otp?email=' . urlencode($user->email) . '&purpose=register');
    }

    /**
     * Verifikasi OTP setelah registrasi.
     * Jika benar, email_verified_at diisi dan warga langsung login.
     */
    public function verifyRegistrationOtp(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $user = User::where('email', strtolower($request->email))
            ->where('role', 'warga')
            ->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Akun warga tidak ditemukan.',
            ], 422);
        }

        if ($user->email_verified_at) {
            Auth::login($user);
            $request->session()->regenerate();

            return response()->json([
                'success' => true,
                'message' => 'Akun sudah terverifikasi.',
                'user' => $user,
            ]);
        }

        $otpRecord = EmailVerificationOtp::where('user_id', $user->id)
            ->where('email', $user->email)
            ->where('otp', $request->otp)
            ->first();

        if (! $otpRecord || now()->greaterThan($otpRecord->expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa.',
            ], 422);
        }

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        $otpRecord->delete();

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'Verifikasi berhasil. Akun warga sudah aktif.',
            'user' => $user,
        ]);
    }

    /**
     * Kirim ulang OTP registrasi jika kode sebelumnya kedaluwarsa.
     */
    public function resendRegistrationOtp(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', strtolower($request->email))
            ->where('role', 'warga')
            ->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Akun warga tidak ditemukan.',
            ], 422);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => true,
                'message' => 'Akun sudah terverifikasi. Silakan login.',
            ]);
        }

        $this->sendRegistrationOtp($user);

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP baru telah dikirim ke email Anda.',
        ]);
    }

    private function sendRegistrationOtp(User $user): string
    {
        $otp = sprintf('%06d', random_int(100000, 999999));

        EmailVerificationOtp::updateOrCreate(
            ['user_id' => $user->id, 'email' => $user->email],
            [
                'otp' => $otp,
                'expires_at' => now()->addMinutes(15),
            ]
        );

        Mail::to($user->email)->send(new SendEmailVerificationOtpMail($otp, $user->name));

        return $otp;
    }
}
