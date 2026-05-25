<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    /**
     * Handle chatbot message (text + optional image).
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',
            'history' => 'nullable|string',
        ]);

        $apiKey = config('services.groq.api_key');

        if (!$apiKey) {
            return response()->json([
                'reply' => 'API Groq belum dikonfigurasi. Silakan tambahkan GROQ_API_KEY di file .env.',
            ], 200);
        }

        // Build system instruction
        $systemInstruction = "Kamu adalah Angon AI, asisten peternakan cerdas dari aplikasi Angonku.id. "
            . "Kamu ahli dalam bidang peternakan ayam broiler, bebek, ikan lele, dan ikan nila. "
            . "Kamu bisa membantu peternak mengidentifikasi jenis ternak, mendiagnosis penyakit dari foto, "
            . "memberikan saran pakan, manajemen kandang, dan tips peternakan. "
            . "Jawab dalam Bahasa Indonesia yang ramah dan mudah dipahami peternak. "
            . "Jika user mengirim gambar, analisis gambar tersebut secara detail. "
            . "Berikan jawaban yang praktis dan actionable.";

        $messages = [];

        // Add system instruction
        $messages[] = [
            'role' => 'system',
            'content' => $systemInstruction,
        ];

        // Add history (sent as JSON string from FormData)
        $historyRaw = $request->input('history', '[]');
        $history = json_decode($historyRaw, true) ?: [];
        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'] === 'user' ? 'user' : 'assistant',
                'content' => $msg['text'],
            ];
        }

        // Add current user message
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageData = base64_encode(file_get_contents($image->getRealPath()));
            $mimeType = $image->getMimeType();

            $contentParts = [
                [
                    'type' => 'text',
                    'text' => $request->input('message'),
                ],
                [
                    'type' => 'image_url',
                    'image_url' => [
                        'url' => "data:{$mimeType};base64,{$imageData}",
                    ],
                ],
            ];

            $messages[] = [
                'role' => 'user',
                'content' => $contentParts,
            ];
        } else {
            $messages[] = [
                'role' => 'user',
                'content' => $request->input('message'),
            ];
        }

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => "Bearer {$apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'meta-llama/llama-4-scout-17b-16e-instruct',
                    'messages' => $messages,
                    'temperature' => 0.7,
                    'max_tokens' => 1024,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $reply = $data['choices'][0]['message']['content'] ?? 'Maaf, saya tidak bisa memproses permintaan ini.';

                return response()->json(['reply' => $reply]);
            }

            Log::error('Groq API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json([
                'reply' => 'Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.',
            ]);

        } catch (\Exception $e) {
            Log::error('Chatbot exception: ' . $e->getMessage());

            return response()->json([
                'reply' => 'Maaf, terjadi kesalahan koneksi. Pastikan koneksi internet stabil.',
            ]);
        }
    }
}
