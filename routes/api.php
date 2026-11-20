<?php

use App\Http\Controllers\Api\GuideController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\ReadingController;
use App\Http\Controllers\Api\QuranLinkerController;
use App\Http\Controllers\Api\ZakatController;
use App\Http\Controllers\MosqueFacilityController;

// Public auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/quran/cross-references', [QuranLinkerController::class, 'getCrossReferences']);
Route::get('/quran/topics', [QuranLinkerController::class, 'getTopics']); // Added route
Route::get('/quran/search/topics', [QuranLinkerController::class, 'searchTopics']);
Route::get('/quran/prophets', [QuranLinkerController::class, 'getProphets']);
Route::get('/quran/figures', [QuranLinkerController::class, 'getFigures']);
Route::get('/mosques/facilities', [MosqueFacilityController::class, 'index']);
Route::middleware('auth:sanctum')->post('/mosques/facilities', [MosqueFacilityController::class, 'store']);
Route::get('/quran/linker', [QuranLinkerController::class, 'getLinks']);
Route::get('/zakat/prices', [ZakatController::class, 'prices'])->middleware('throttle:30,1');
Route::middleware('throttle:20,1')->post('/guide/chat', [GuideController::class, 'chat']);
// Protected routes


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']); 
    Route::get('/bookmarks/full',[BookmarkController::class,'indexFull']);
    Route::get('/bookmarks', [BookmarkController::class, 'index']);
    Route::post('/bookmarks', [BookmarkController::class, 'store']);
    Route::delete('/bookmarks/{verse_key}', [BookmarkController::class, 'destroy'])
         ->where('verse_key', '.*');
    Route::get('/last-read', [ReadingController::class, 'lastRead']);
    Route::post('/last-read', [ReadingController::class, 'save']);
});