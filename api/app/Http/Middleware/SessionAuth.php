<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Mirrors the Express authMiddleware: reads the aw_session cookie (JWT),
 * verifies it, loads the DB session + user, sets req attribute 'user'.
 */
class SessionAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->cookie('aw_session')
            ?? preg_replace('/^Bearer /', '', (string) $request->header('Authorization'));

        if ($token) {
            $payload = self::jwtVerify($token);
            if ($payload && isset($payload->sub)) {
                $session = DB::table('Session')->where('token', $token)->first();
                if ($session && strtotime($session->expiresAt) > time()) {
                    $user = DB::table('User')->where('id', $payload->sub)->first();
                    if ($user && ($user->isActive ?? 1)) {
                        $request->attributes->set('user', $user);
                        if (!$user->lastActiveAt || strtotime($user->lastActiveAt) < time() - 30) {
                            DB::table('User')->where('id', $user->id)->update(['lastActiveAt' => now()->toDateTimeString()]);
                        }
                    }
                }
            }
        }
        return $next($request);
    }

    public static function jwtVerify(string $jwt): ?object
    {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) return null;
        [$h, $p, $s] = $parts;
        $secret = env('JWT_SECRET', 'dev-secret');
        $sig = rtrim(strtr(base64_encode(hash_hmac('sha256', "$h.$p", $secret, true)), '+/', '-_'), '=');
        if (!hash_equals($sig, $s)) return null;
        $payload = json_decode(base64_decode(strtr($p, '-_', '+/')));
        if (!$payload || (isset($payload->exp) && $payload->exp < time())) return null;
        return $payload;
    }

    public static function jwtSign(array $payload, int $ttlSec): string
    {
        $b64 = fn ($d) => rtrim(strtr(base64_encode($d), '+/', '-_'), '=');
        $h = $b64(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $p = $b64(json_encode($payload + ['exp' => time() + $ttlSec]));
        $secret = env('JWT_SECRET', 'dev-secret');
        $s = $b64(hash_hmac('sha256', "$h.$p", $secret, true));
        return "$h.$p.$s";
    }
}
