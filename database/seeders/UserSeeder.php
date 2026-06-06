<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@kelurahan.id',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Petugas Staf',
            'email' => 'staf@kelurahan.id',
            'password' => Hash::make('staf123'),
            'role' => 'staf',
        ]);

        User::create([
            'name' => 'Warga Demo',
            'email' => 'warga@kelurahan.id',
            'password' => Hash::make('warga123'),
            'role' => 'warga',
        ]);
    }
}
