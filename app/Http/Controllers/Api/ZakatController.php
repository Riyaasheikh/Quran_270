<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Zakat\MetalPriceService;
use Illuminate\Http\JsonResponse;

class ZakatController extends Controller
{
    /**
     * GET /api/zakat/prices
     *
     * Gold/silver price per gram (USD) and FX rates for the Zakat calculator.
     * 503 means no live OR cached prices exist; the page then asks the user to enter them.
     */
    public function prices(MetalPriceService $prices): JsonResponse
    {
        $snapshot = $prices->snapshot();

        if ($snapshot === null) {
            return response()->json([
                'success' => false,
                'message' => 'Live prices are unavailable right now. Enter prices manually.',
            ], 503);
        }

        return response()->json(['success' => true] + $snapshot);
    }
}