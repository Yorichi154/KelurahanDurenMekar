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
        'kontak',
        'email',
        'alamat',
        'tugas',
        'kewenangan',
    ];
}
