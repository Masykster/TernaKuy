<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * ImageService — Ready-to-use image optimization utility.
 *
 * Usage in any controller:
 *   $path = ImageService::optimize($request->file('photo'));
 *   // Returns the stored path, e.g. "images/abc123.webp"
 *
 * Handles: resize to max dimension, quality reduction, WebP conversion.
 * Uses PHP GD extension (already installed in the Docker image).
 */
class ImageService
{
    /**
     * Optimize and store an uploaded image.
     *
     * @param  UploadedFile  $file      The uploaded image file
     * @param  string        $directory Storage subdirectory (default: 'images')
     * @param  int           $maxWidth  Maximum width in px (default: 1200)
     * @param  int           $maxHeight Maximum height in px (default: 1200)
     * @param  int           $quality   WebP quality 0-100 (default: 80)
     * @return string                   The stored file path relative to disk root
     */
    public static function optimize(
        UploadedFile $file,
        string $directory = 'images',
        int $maxWidth = 1200,
        int $maxHeight = 1200,
        int $quality = 80
    ): string {
        $image = self::createImageFromFile($file);

        if (!$image) {
            // Fallback: store original if GD can't process it
            return $file->store($directory, 'public');
        }

        // Get original dimensions
        $origWidth = imagesx($image);
        $origHeight = imagesy($image);

        // Calculate new dimensions maintaining aspect ratio
        $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight, 1.0);
        $newWidth = (int) round($origWidth * $ratio);
        $newHeight = (int) round($origHeight * $ratio);

        // Resize if needed
        if ($ratio < 1.0) {
            $resized = imagecreatetruecolor($newWidth, $newHeight);
            // Preserve transparency
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
            imagedestroy($image);
            $image = $resized;
        }

        // Generate unique filename
        $filename = Str::uuid() . '.webp';
        $relativePath = $directory . '/' . $filename;
        $absolutePath = Storage::disk('public')->path($relativePath);

        // Ensure directory exists
        $dir = dirname($absolutePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        // Convert to WebP
        imagewebp($image, $absolutePath, $quality);
        imagedestroy($image);

        return $relativePath;
    }

    /**
     * Create a GD image resource from an uploaded file.
     */
    private static function createImageFromFile(UploadedFile $file)
    {
        $mime = $file->getMimeType();
        $path = $file->getRealPath();

        return match ($mime) {
            'image/jpeg', 'image/jpg' => imagecreatefromjpeg($path),
            'image/png' => imagecreatefrompng($path),
            'image/gif' => imagecreatefromgif($path),
            'image/webp' => imagecreatefromwebp($path),
            default => null,
        };
    }
}
