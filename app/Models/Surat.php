<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Surat extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'jenis_surat',
        'nomor_surat',
        'keperluan',
        'data_surat',
        'dibuat_oleh',
        'catatan_staf',
        'file_surat',
        'konten_final',
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

    public function pickup()
    {
        return $this->hasOne(SuratPickup::class, 'submission_id');
    }
}

