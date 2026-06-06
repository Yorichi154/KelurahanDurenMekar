<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use Illuminate\Http\Request;

class AgendaController extends Controller
{
    public function index()
    {
        return Agenda::latest()->get();
    }

    public function store(Request $request)
    {
        $agenda = Agenda::create([
            'title'    => $request->title,
            'date'     => $request->date,
            'time'     => $request->time,
            'location' => $request->location,
            'content'  => $request->content,
        ]);

        return response()->json($agenda, 201);
    }

    public function show(Agenda $agenda)
    {
        return $agenda;
    }

    public function update(Request $request, Agenda $agenda)
    {
        $agenda->update([
            'title'    => $request->title,
            'date'     => $request->date,
            'time'     => $request->time,
            'location' => $request->location,
            'content'  => $request->content,
        ]);

        return response()->json($agenda);
    }

    public function destroy(Agenda $agenda)
    {
        $agenda->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
