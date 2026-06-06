<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index()
    {
        return Faq::latest()->get();
    }

    public function store(Request $request)
    {
        $faq = Faq::create([
            'question' => $request->question,
            'answer'   => $request->answer,
            'category' => $request->category,
        ]);

        return response()->json($faq, 201);
    }

    public function show(Faq $faq)
    {
        return $faq;
    }

    public function update(Request $request, Faq $faq)
    {
        $faq->update([
            'question' => $request->question,
            'answer'   => $request->answer,
            'category' => $request->category,
        ]);

        return response()->json($faq);
    }

    public function destroy(Faq $faq)
    {
        $faq->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
