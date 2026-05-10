<?php
// app/Models/ReadingSession.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReadingSession extends Model
{
    protected $fillable = [
        'user_id', 'surah_id', 'surah_name',
        'surah_name_arabic', 'verse_number', 'verse_key'
    ];
}