<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendEmailVerificationOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $otp;
    public string $name;

    public function __construct(string $otp, string $name = 'Warga')
    {
        $this->otp = $otp;
        $this->name = $name;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kode OTP Verifikasi Akun - Kelurahan Duren Mekar',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: "
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>
                    <h2 style='color: #1e3a8a; text-align: center;'>Verifikasi Akun Warga</h2>
                    <p>Halo, <strong>{$this->name}</strong>.</p>
                    <p>Terima kasih sudah mendaftar di Portal Kelurahan Duren Mekar. Gunakan kode OTP berikut untuk mengaktifkan akun Anda:</p>
                    <div style='background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;'>
                        <span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;'>{$this->otp}</span>
                    </div>
                    <p style='color: #4b5563; font-size: 14px;'>Kode OTP ini berlaku selama 15 menit. Jangan bagikan kode ini kepada siapa pun.</p>
                    <p>Setelah verifikasi berhasil, akun Anda dapat digunakan untuk mengakses layanan warga seperti pengajuan surat, pengaduan, dan chat dengan staf.</p>
                    <hr style='border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;' />
                    <p style='color: #9ca3af; font-size: 12px; text-align: center;'>Sistem Informasi Kelurahan Duren Mekar</p>
                </div>
            "
        );
    }
}
