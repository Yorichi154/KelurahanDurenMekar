<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Surat extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'jenis_surat',
        'keperluan',
        'file_surat',
        'status',
        'berkas',
    ];

    protected $casts = [
        'berkas' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
