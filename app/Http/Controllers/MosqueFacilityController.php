<?php

namespace App\Http\Controllers;

use App\Models\MosqueFacility;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class MosqueFacilityController extends Controller
{
    // Batch-lookup community records for a list of OpenStreetMap IDs
    public function index(Request $request)
    {
        $osmIds = $request->input('osm_ids', []);
        if (is_string($osmIds)) {
            $osmIds = explode(',', $osmIds);
        }

        // Only accept real OSM ids like "node_123" / "way_456", and cap the batch size
        $osmIds = collect($osmIds)
            ->map(fn ($id) => trim((string) $id))
            ->filter(fn ($id) => preg_match('/^(node|way|relation)_\d+$/', $id))
            ->unique()
            ->take(300)
            ->values();

        if ($osmIds->isEmpty()) {
            return response()->json(new \stdClass());
        }

        $facilities = MosqueFacility::whereIn('osm_id', $osmIds)->get()->keyBy('osm_id');

        // An empty result must be {} (not []) so the frontend can index it by id
        return response()->json($facilities->isEmpty() ? new \stdClass() : $facilities);
    }

    // Create or update facility & Jama'ah info for a mosque
    public function store(Request $request)
    {
        $validated = $request->validate([
            'osm_id' => ['required', 'string', 'max:100', 'regex:/^(node|way|relation)_\d+$/'],
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'has_women_section' => 'boolean',
            'has_wudu_area' => 'boolean',
            'has_wheelchair_access' => 'boolean',
            'has_parking' => 'boolean',
            'has_ac' => 'boolean',
            'has_jumuah' => 'boolean',
            'fajr_jamaah' => 'nullable|date_format:H:i',
            'dhuhr_jamaah' => 'nullable|date_format:H:i',
            'asr_jamaah' => 'nullable|date_format:H:i',
            'maghrib_jamaah' => 'nullable|date_format:H:i',
            'isha_jamaah' => 'nullable|date_format:H:i',
            'jumuah_jamaah' => 'nullable|date_format:H:i',
        ]);

        $facility = DB::transaction(function () use ($validated, $request) {
            $existing = MosqueFacility::where('osm_id', $validated['osm_id'])
                ->lockForUpdate()
                ->first();

            if ($existing) {
                // Keep the original name/location; only update facilities + times
                $existing->fill(Arr::except($validated, ['osm_id', 'name', 'latitude', 'longitude']));
                $existing->verifications_count = $existing->verifications_count + 1;
                $existing->updated_by = $request->user()->id;
                $existing->save();

                return $existing;
            }

            return MosqueFacility::create(array_merge($validated, [
                'verifications_count' => 1,
                'updated_by' => $request->user()->id,
            ]));
        });

        return response()->json([
            'message' => 'Mosque facilities & Jama\'ah schedule updated.',
            'facility' => $facility,
        ]);
    }
}