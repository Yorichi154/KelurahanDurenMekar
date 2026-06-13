<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuratPickup extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'nomor_surat',
        'nomor_antrian',
        'tanggal_pengambilan',
        'status_pengambilan',
    ];

    public function submission()
    {
        return $this->belongsTo(Surat::class, 'submission_id');
    }
}
