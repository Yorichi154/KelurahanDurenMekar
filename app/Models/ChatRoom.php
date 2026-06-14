<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatRoom extends Model
{
    protected $fillable = [
        'warga_id',
        'staf_id',
        'status',
    ];

    public function warga()
    {
        return $this->belongsTo(User::class, 'warga_id');
    }

    public function staf()
    {
        return $this->belongsTo(User::class, 'staf_id');
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'room_id');
    }
}
