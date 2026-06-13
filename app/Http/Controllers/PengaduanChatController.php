<?php

namespace App\Http\Controllers;

use App\Models\Pengaduan;
use App\Models\PengaduanChat;
use Illuminate\Http\Request;

class PengaduanChatController extends Controller
{
    // ==================== WARGA METHODS ====================

    public function getChatsWarga($id)
    {
        $pengaduan = Pengaduan::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $chats = PengaduanChat::with('user')
            ->where('pengaduan_id', $id)
            ->oldest()
            ->get();

        return response()->json($chats);
    }

    public function sendChatWarga(Request $request, $id)
    {
        $request->validate([
            'pesan' => 'required|string',
        ]);

        $pengaduan = Pengaduan::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $chat = PengaduanChat::create([
            'pengaduan_id' => $id,
            'user_id' => auth()->id(),
            'pesan' => $request->pesan,
        ]);

        return response()->json($chat->load('user'), 201);
    }

    // ==================== STAF METHODS ====================

    public function getChatsStaf($id)
    {
        $pengaduan = Pengaduan::findOrFail($id);

        $chats = PengaduanChat::with('user')
            ->where('pengaduan_id', $id)
            ->oldest()
            ->get();

        return response()->json($chats);
    }

    public function sendChatStaf(Request $request, $id)
    {
        $request->validate([
            'pesan' => 'required|string',
        ]);

        $pengaduan = Pengaduan::findOrFail($id);

        $chat = PengaduanChat::create([
            'pengaduan_id' => $id,
            'user_id' => auth()->id(),
            'pesan' => $request->pesan,
        ]);

        return response()->json($chat->load('user'), 201);
    }
}
