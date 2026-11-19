<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MosqueFacility extends Model
{
    protected $fillable = [
        'osm_id',
        'name',
        'latitude',
        'longitude',
        'has_women_section',
        'has_wudu_area',
        'has_wheelchair_access',
        'has_parking',
        'has_ac',
        'has_jumuah',
        'fajr_jamaah',
        'dhuhr_jamaah',
        'asr_jamaah',
        'maghrib_jamaah',
        'isha_jamaah',
        'jumuah_jamaah',
        'verifications_count',
        'updated_by',
    ];

    protected $casts = [
        'has_women_section' => 'boolean',
        'has_wudu_area' => 'boolean',
        'has_wheelchair_access' => 'boolean',
        'has_parking' => 'boolean',
        'has_ac' => 'boolean',
        'has_jumuah' => 'boolean',
    ];
}