<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pelayanan extends Model
{
    protected $table = 'surat_types';

    protected $fillable = [
        'nama_surat',
        'kode_surat',
        'deskripsi',
        'estimasi_hari',
        'metode_pengajuan',
        'metode_hasil',
        'status',
        'teks_tombol',
        'syarat',
        'langkah',
        'form_fields',
        'jam_pelayanan',
        'lokasi',
        'biaya',
        'deskripsi_surat',
        // Keep old columns in fillable for backwards compatibility with controller inputs
        'nama',
        'slug',
        'estimasi',
        'online',
        'catatan',
    ];

    protected $casts = [
        'syarat' => 'array',
        'langkah' => 'array',
        'form_fields' => 'array',
    ];

    protected $appends = [
        'nama',
        'slug',
        'estimasi',
        'online',
        'catatan',
    ];

    public function template()
    {
        return $this->hasOne(TemplateSurat::class, 'pelayanan_id');
    }

    // Accessors & Mutators for backwards compatibility with existing frontend/backend code
    public function getNamaAttribute()
    {
        return $this->nama_surat;
    }

    public function setNamaAttribute($value)
    {
        $this->nama_surat = $value;
        $this->attributes['nama_surat'] = $value;
    }

    public function getSlugAttribute()
    {
        return $this->kode_surat;
    }

    public function setSlugAttribute($value)
    {
        $this->kode_surat = $value;
        $this->attributes['kode_surat'] = $value;
    }

    public function getEstimasiAttribute()
    {
        return $this->estimasi_hari . ' Hari Kerja';
    }

    public function setEstimasiAttribute($value)
    {
        $days = (int) filter_var($value, FILTER_SANITIZE_NUMBER_INT) ?: 1;
        $this->estimasi_hari = $days;
        $this->attributes['estimasi_hari'] = $days;
    }

    public function getOnlineAttribute()
    {
        return $this->metode_pengajuan === 'online';
    }

    public function setOnlineAttribute($value)
    {
        $method = $value ? 'online' : 'offline';
        $this->metode_pengajuan = $method;
        $this->attributes['metode_pengajuan'] = $method;
    }

    public function getCatatanAttribute()
    {
        return $this->deskripsi;
    }

    public function setCatatanAttribute($value)
    {
        $this->deskripsi = $value;
        $this->attributes['deskripsi'] = $value;
    }
}
