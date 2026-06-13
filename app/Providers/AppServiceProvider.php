<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Support\Facades\Mail;
use App\Mail\BrevoTransport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        try {
            Mail::extend('brevo', function (array $config) {
                return new BrevoTransport($config['key'] ?? env('BREVO_API_KEY'));
            });

            if (!Schema::hasTable('pengaduan_chats')) {
                Artisan::call('migrate', ['--force' => true]);
            }
            if (!file_exists(public_path('storage'))) {
                Artisan::call('storage:link');
            }
        } catch (\Exception $e) {
            // Silence database connection issues during console commands / initialization
        }
    }
}
