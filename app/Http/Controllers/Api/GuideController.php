<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuideConversation;
use App\Services\GuideAgent\GuideAgentService;
use App\Services\GuideAgent\GuideContextBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GuideController extends Controller
{
    public function __construct(
        protected GuideAgentService $guideAgent,
        protected GuideContextBuilder $contextBuilder
    ) {
    }

    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message'        => ['required', 'string', 'max:1000'],
            'session_id'     => ['nullable', 'string', 'max:64'],
            'history'        => ['nullable', 'array', 'max:10'],
            'history.*.role' => ['required_with:history', 'string', 'in:user,assistant'],
            'history.*.text' => ['required_with:history', 'string', 'max:2000'],
        ]);

        $sessionId = $validated['session_id'] ?? (string) Str::uuid();
        $message   = trim($validated['message']);
        $history   = $validated['history'] ?? [];

        // Ground Gemini's response with matching MySQL records
        $dbContext = $this->contextBuilder->build($message);

        $result = $this->guideAgent->ask($message, $history, $dbContext);

        GuideConversation::create([
            'session_id'       => $sessionId,
            'user_message'     => $message,
            'assistant_reply'  => $result['answer'],
            'navigation_path'  => $result['navigation']['has_route'] ? $result['navigation']['path'] : null,
            'navigation_label' => $result['navigation']['has_route'] ? $result['navigation']['label'] : null,
            'citations'        => $result['citations'] ?? [],
        ]);

        return response()->json([
            'session_id' => $sessionId,
            'reply'      => $result['answer'],
            'navigation' => $result['navigation'],
            'citations'  => $result['citations'] ?? [],
        ]);
    }
}