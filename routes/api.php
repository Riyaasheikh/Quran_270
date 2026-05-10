<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\ReadingController;

// Public auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout']);

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