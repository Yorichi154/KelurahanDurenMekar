<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\PasswordResetOtp;
use App\Mail\SendOtpMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_screen_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_reset_password_otp_can_be_requested(): void
    {
        Mail::fake();

        $user = User::factory()->create();

        $response = $this->post('/forgot-password', ['email' => $user->email]);

        // Check if OTP record was created
        $this->assertDatabaseHas('password_reset_otps', [
            'email' => $user->email,
        ]);

        // Assert mail was sent
        Mail::assertSent(SendOtpMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_otp_can_be_verified(): void
    {
        $user = User::factory()->create();
        $otp = '123456';

        PasswordResetOtp::create([
            'email' => $user->email,
            'otp' => $otp,
            'expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->post('/verify-otp', [
            'email' => $user->email,
            'otp' => $otp,
        ]);

        $response->assertJson([
            'success' => true,
            'message' => 'Kode OTP valid.',
        ]);
    }

    public function test_password_can_be_reset_with_valid_otp(): void
    {
        $user = User::factory()->create();
        $otp = '123456';

        PasswordResetOtp::create([
            'email' => $user->email,
            'otp' => $otp,
            'expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->post('/reset-password', [
            'token' => $otp,
            'email' => $user->email,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        // Since it's a JSON/web request, it might redirect or return JSON
        if ($response->status() === 302) {
            $response->assertRedirect(route('login'));
        } else {
            $response->assertJson([
                'success' => true,
            ]);
        }

        // Verify password was changed
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('new-password', $user->fresh()->password));

        // Verify OTP was deleted
        $this->assertDatabaseMissing('password_reset_otps', [
            'email' => $user->email,
        ]);
    }
}
