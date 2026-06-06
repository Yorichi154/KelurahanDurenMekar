<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pelayanan extends Model
{
    protected $fillable = [
        'nama',
        'slug',
        'estimasi',
        'biaya',
        'online',
        'teks_tombol',
        'syarat',
        'langkah',
        'form_fields',
        'jam_pelayanan',
        'lokasi',
        'catatan',
    ];

    protected $casts = [
        'online' => 'boolean',
        'syarat' => 'array',
        'langkah' => 'array',
        'form_fields' => 'array',
    ];
}
