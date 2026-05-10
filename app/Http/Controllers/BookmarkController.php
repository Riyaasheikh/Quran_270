<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookmarkController extends Controller
{
    public function index()
    {
        /** @var User $user */
        $user = Auth::user();

        return response()->json(
            $user->bookmarks()->pluck('verse_key')
        );
    }
    public function indexFull()
{
    /** @var User $user */
    $user = Auth::user();
    return response()->json($user->bookmarks()->latest()->get());
}

    public function store(Request $request)
    {
        $request->validate([
            'verse_key'    => 'required',
            'surah_id'     => 'required|integer',
            'verse_number' => 'required|integer',
        ]);

        /** @var User $user */
        $user = Auth::user();

        $user->bookmarks()->updateOrCreate(
            ['verse_key' => $request->verse_key],
            [
                'surah_id'       => $request->surah_id,
                'verse_number'   => $request->verse_number,
                'translation_id' => $request->translation_id ?? 85,
            ]
        );

        return response()->json(['message' => 'Bookmarked!']);
    }

    public function destroy(string $verse_key)
    {
        /** @var User $user */
        $user = Auth::user();

        $user->bookmarks()->where('verse_key', $verse_key)->delete();

        return response()->json(['message' => 'Removed']);
    }
}