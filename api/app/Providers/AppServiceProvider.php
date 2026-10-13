<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
        // Provision admin from env on startup (mirrors ensureAdmin() in the old Express API)
        if ($this->app->runningInConsole() && !app()->runningUnitTests()) return;
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');
        if (!$email || !$password) return;
        $marker = storage_path('app/.admin-provisioned');
        $sig = hash('sha256', $email . '|' . $password);
        if (file_exists($marker) && trim(@file_get_contents($marker)) === $sig) return;
        try {
            $existing = \Illuminate\Support\Facades\DB::table('User')->where('email', $email)->first();
            $hash = \Illuminate\Support\Facades\Hash::make($password);
            if ($existing) {
                \Illuminate\Support\Facades\DB::table('User')->where('email', $email)
                    ->update(['role' => 'admin', 'passwordHash' => $hash, 'emailVerifiedAt' => now()]);
            } else {
                \Illuminate\Support\Facades\DB::table('User')->insert([
                    'id' => 'c' . uniqid() . bin2hex(random_bytes(8)),
                    'name' => 'Administrator', 'email' => $email, 'passwordHash' => $hash,
                    'role' => 'admin', 'emailVerifiedAt' => now(), 'createdAt' => now(),
                ]);
            }
            @file_put_contents($marker, $sig);
        } catch (\Throwable $e) { /* DB not ready yet */ }
    }
}
