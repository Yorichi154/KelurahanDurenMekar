<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengaduan extends Model
{
    use HasFactory;

    protected $fillable = [

        'user_id',

        'judul',

        'isi',

        'kategori',

        'lokasi',

        'lampiran',

        'status',

        'foto_tindak_lanjut',

    ];

    public function user()
    {
        return $this->belongsTo(
            User::class
        );
    }
}
