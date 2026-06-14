<?php

namespace App\Http\Controllers;

use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    // ==================== COMMON METHODS ====================

    /**
     * Get or create a chat room between a warga and a staf.
     */
    public function getOrCreateRoom(Request $request)
    {
        $request->validate([
            'warga_id' => 'required|exists:users,id',
            'staf_id' => 'required|exists:users,id',
        ]);

        $wargaId = $request->warga_id;
        $stafId = $request->staf_id;

        $room = ChatRoom::where('warga_id', $wargaId)
            ->where('staf_id', $stafId)
            ->first();

        if (!$room) {
            $room = ChatRoom::create([
                'warga_id' => $wargaId,
                'staf_id' => $stafId,
                'status' => 'open',
            ]);
        }

        return response()->json($room);
    }

    /**
     * Get messages in a room.
     */
    public function getMessages($roomId)
    {
        $room = ChatRoom::findOrFail($roomId);
        
        // Mark other party's messages as read
        ChatMessage::where('room_id', $room->id)
            ->where('sender_id', '!=', Auth::id())
            ->update(['is_read' => true]);

        $messages = ChatMessage::where('room_id', $room->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    /**
     * Send a message to a room.
     */
    public function sendMessage(Request $request, $roomId)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $room = ChatRoom::findOrFail($roomId);
        $sender = Auth::user();
        $senderRole = $sender->role === 'staf' || $sender->role === 'admin' ? 'staf' : 'warga';

        $msg = ChatMessage::create([
            'room_id' => $room->id,
            'sender_id' => $sender->id,
            'sender_role' => $senderRole,
            'message' => $request->message,
            'is_read' => false,
        ]);

        // Clean up: touch room updated_at
        $room->touch();

        return response()->json($msg, 201);
    }

    // ==================== WARGA METHODS ====================

    /**
     * Get list of all staff with online status and unread counts for current warga.
     */
    public function getStaffList()
    {
        $wargaId = Auth::id();
        $staff = User::whereIn('role', ['staf', 'admin'])->get();

        $result = [];
        foreach ($staff as $st) {
            // Check online status (active in last 5 minutes)
            $isOnline = $st->last_seen_at && $st->last_seen_at->gt(now()->subMinutes(5));

            // Find room
            $room = ChatRoom::where('warga_id', $wargaId)
                ->where('staf_id', $st->id)
                ->first();

            $unreadCount = 0;
            $lastMessage = null;
            $roomId = null;

            if ($room) {
                $roomId = $room->id;
                $unreadCount = ChatMessage::where('room_id', $room->id)
                    ->where('sender_id', $st->id)
                    ->where('is_read', false)
                    ->count();

                $lastMsgModel = ChatMessage::where('room_id', $room->id)
                    ->latest()
                    ->first();
                if ($lastMsgModel) {
                    $lastMessage = [
                        'message' => $lastMsgModel->message,
                        'created_at' => $lastMsgModel->created_at,
                    ];
                }
            }

            $result[] = [
                'id' => $st->id,
                'name' => $st->name,
                'email' => $st->email,
                'role' => $st->role,
                'is_online' => (bool)$isOnline,
                'last_seen_at' => $st->last_seen_at,
                'room_id' => $roomId,
                'unread_count' => $unreadCount,
                'last_message' => $lastMessage,
            ];
        }

        return response()->json($result);
    }

    // ==================== STAF METHODS ====================

    /**
     * Get list of warga who have a chat room with this staff member.
     */
    public function getWargaList()
    {
        $stafId = Auth::id();

        // Get all rooms for this staff
        $rooms = ChatRoom::where('staf_id', $stafId)
            ->with('warga')
            ->orderBy('updated_at', 'desc')
            ->get();

        $result = [];
        foreach ($rooms as $room) {
            $w = $room->warga;
            if (!$w) continue;

            $isOnline = $w->last_seen_at && $w->last_seen_at->gt(now()->subMinutes(5));
            $unreadCount = ChatMessage::where('room_id', $room->id)
                ->where('sender_id', $w->id)
                ->where('is_read', false)
                ->count();

            $lastMsgModel = ChatMessage::where('room_id', $room->id)
                ->latest()
                ->first();

            $lastMessage = null;
            if ($lastMsgModel) {
                $lastMessage = [
                    'message' => $lastMsgModel->message,
                    'created_at' => $lastMsgModel->created_at,
                ];
            }

            $result[] = [
                'id' => $w->id,
                'name' => $w->name,
                'email' => $w->email,
                'is_online' => (bool)$isOnline,
                'last_seen_at' => $w->last_seen_at,
                'room_id' => $room->id,
                'unread_count' => $unreadCount,
                'last_message' => $lastMessage,
            ];
        }

        // Add any other citizen who doesn't have a room yet but is active, or we can just fetch all citizens
        // Let's add all citizens to the staff list so staff can start a chat with anyone!
        $allWarga = User::where('role', 'warga')->get();
        foreach ($allWarga as $w) {
            // check if already in list
            $exists = false;
            foreach ($result as $r) {
                if ($r['id'] === $w->id) {
                    $exists = true;
                    break;
                }
            }
            if ($exists) continue;

            $isOnline = $w->last_seen_at && $w->last_seen_at->gt(now()->subMinutes(5));
            
            $result[] = [
                'id' => $w->id,
                'name' => $w->name,
                'email' => $w->email,
                'is_online' => (bool)$isOnline,
                'last_seen_at' => $w->last_seen_at,
                'room_id' => null,
                'unread_count' => 0,
                'last_message' => null,
            ];
        }

        return response()->json($result);
    }
}
