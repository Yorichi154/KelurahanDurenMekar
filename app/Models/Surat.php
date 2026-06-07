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
        'nomor_surat',
        'keperluan',
        'data_surat',
        'dibuat_oleh',
        'catatan_staf',
        'file_surat',
        'status',
        'berkas',
    ];

    protected $casts = [
        'berkas'     => 'array',
        'data_surat' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Staff member who created (generated) this letter
     */
    public function pembuatSurat()
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
}

