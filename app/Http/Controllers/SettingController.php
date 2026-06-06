<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        return Setting::firstOrCreate([]);
    }

    public function store(Request $request)
    {
        $setting = Setting::first();

        if ($setting) {
            $setting->update($request->all());

            return response()->json($setting);
        }

        return response()->json(
            Setting::create($request->all()),
            201
        );
    }

    public function show(Setting $setting)
    {
        return $setting;
    }

    public function update(Request $request, Setting $setting)
    {
        $setting->update($request->all());

        return response()->json($setting);
    }

    public function destroy(Setting $setting)
    {
        $setting->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
