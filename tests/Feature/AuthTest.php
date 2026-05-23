<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('register dengan data valid -> user terbuat, redirect onboarding', function () {
    $response = $this->post('/register', [
        'name' => 'Peternak Baru',
        'email' => 'baru@example.com',
        'phone' => '081234567890',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'province' => 'Jawa Barat',
        'city' => 'Bandung',
    ]);

    $this->assertDatabaseHas('users', [
        'email' => 'baru@example.com',
    ]);

    // RegisteredUserController logs in the user and redirects to dashboard,
    // which in turn redirects to onboarding because the user has no farms yet.
    $response->assertRedirect(route('dashboard'));
    
    // Follow the redirect to verify it lands on onboarding
    $this->actingAs(User::where('email', 'baru@example.com')->first())
         ->get(route('dashboard'))
         ->assertRedirect(route('onboarding'));
});

test('register dengan email duplikat -> 422', function () {
    User::create([
        'name' => 'Peternak Lama',
        'email' => 'lama@example.com',
        'password' => bcrypt('password123'),
        'is_active' => true,
    ]);

    $response = $this->postJson('/register', [
        'name' => 'Peternak Klon',
        'email' => 'lama@example.com',
        'phone' => '081234567899',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('email');
});

test('login dengan kredensial benar -> session aktif', function () {
    $user = User::create([
        'name' => 'Peternak Sukses',
        'email' => 'sukses@example.com',
        'password' => bcrypt('password123'),
        'is_active' => true,
    ]);

    $response = $this->post('/login', [
        'email' => 'sukses@example.com',
        'password' => 'password123',
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('dashboard'));
});

test('login salah password -> 401', function () {
    $user = User::create([
        'name' => 'Peternak Sukses',
        'email' => 'sukses@example.com',
        'password' => bcrypt('password123'),
        'is_active' => true,
    ]);

    $response = $this->post('/login', [
        'email' => 'sukses@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(401);
    $this->assertGuest();
});
