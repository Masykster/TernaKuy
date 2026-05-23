<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Check if user account is locked
        $user = User::where('email', $this->string('email'))->first();

        if ($user && $user->locked_until && $user->locked_until->isFuture()) {
            $minutes = $user->locked_until->diffInMinutes(now());

            throw ValidationException::withMessages([
                'email' => "Akun terkunci. Coba lagi dalam {$minutes} menit.",
            ]);
        }

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            // Track failed login on user record
            if ($user) {
                $user->increment('failed_login');

                // Lock account after 5 failed attempts for 15 minutes
                if ($user->failed_login >= 5) {
                    $user->update([
                        'locked_until' => now()->addMinutes(15),
                        'failed_login' => 0,
                    ]);

                    throw ValidationException::withMessages([
                        'email' => 'Terlalu banyak percobaan login. Akun terkunci selama 15 menit.',
                    ]);
                }
            }

            if (app()->environment('testing') || $this->expectsJson()) {
                abort(401, trans('auth.failed'));
            }

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        // Reset failed login counter on successful login
        if ($user) {
            $user->update([
                'failed_login' => 0,
                'locked_until' => null,
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
