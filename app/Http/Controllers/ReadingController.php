<?php
// app/Http/Controllers/ReadingController.php

namespace App\Http\Controllers;

use App\Models\ReadingSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReadingController extends Controller
{
   

public function lastRead()
{
    /** @var \App\Models\User $user */
    $user = Auth::user();
    
    $last = $user->readingSessions()->latest('updated_at')->first();
    
    return response()->json($last);
}

    public function save(Request $request)
    {
        $request->validate([
            'surah_id'         => 'required|integer',
            'surah_name'       => 'required|string',
            'surah_name_arabic'=> 'nullable|string',
            'verse_number'     => 'required|integer',
            'verse_key'        => 'required|string',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $user->readingSessions()->updateOrCreate(
            ['surah_id' => $request->surah_id],
            [
                'surah_name'        => $request->surah_name,
                'surah_name_arabic' => $request->surah_name_arabic,
                'verse_number'      => $request->verse_number,
                'verse_key'         => $request->verse_key,
            ]
        );

        return response()->json(['message' => 'Progress saved']);
    }
}