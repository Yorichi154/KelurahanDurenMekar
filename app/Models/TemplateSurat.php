<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TemplateSurat extends Model
{
    protected $fillable = [
        'pelayanan_id',
        'konten_html',
        'versi',
    ];

    public function pelayanan()
    {
        return $this->belongsTo(Pelayanan::class);
    }
}
