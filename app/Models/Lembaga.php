<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lembaga extends Model
{
    protected $fillable = [
        'jenis',
        'nama',
        'jabatan',
        'wilayah',
        'kontak',
        'keterangan',
    ];
}
