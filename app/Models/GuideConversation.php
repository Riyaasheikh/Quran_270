<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuideConversation extends Model
{
    protected $fillable = [
        'session_id',
        'user_message',
        'assistant_reply',
        'navigation_path',
        'navigation_label',
        'citations',
    ];

    protected $casts = [
        'citations' => 'array',
    ];
}