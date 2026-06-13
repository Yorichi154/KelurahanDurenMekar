<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnitKerja extends Model
{
    protected $fillable = [
        'jenis',
        'nama_unit',
        'nama_pimpinan',
        'jabatan_pimpinan',
        'foto_pimpinan',
        'nip_pimpinan',
        'pendidikan_pimpinan',
        'kontak',
        'email',
        'alamat',
        'tugas',
        'kewenangan',
        'riwayat_jabatan',
        'tim_pegawai',
    ];

    protected $casts = [
        'tim_pegawai' => 'array',
    ];
}
