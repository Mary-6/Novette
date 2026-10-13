<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use DatabaseTransactions;

    private function makeUser(string $role): array
    {
        $email = $role . '-' . uniqid() . '@example.com';
        DB::table('User')->insert([
            'id' => 'c' . bin2hex(random_bytes(12)), 'name' => ucfirst($role) . ' Tester', 'email' => $email,
            'passwordHash' => Hash::make('secret-pass-1'), 'role' => $role, 'emailVerifiedAt' => now(), 'createdAt' => now(),
        ]);
        return [$email, 'secret-pass-1'];
    }

    private function loginAs(string $role): array
    {
        [$email, $pass] = $this->makeUser($role);
        $res = $this->postJson('/api/admin/auth/login', ['email' => $email, 'password' => $pass])->assertOk();
        return ['Authorization' => 'Bearer ' . $res->getCookie('aw_session', false)->getValue()];
    }

    public function test_admin_pages_redirect_guests_to_login(): void
    {
        $this->get('/admin/dashboard')->assertRedirect('/admin/login');
        $this->get('/admin/login')->assertOk();
    }

    public function test_admin_api_rejects_guests(): void
    {
        $this->getJson('/api/admin/dashboard')->assertStatus(401);
    }

    public function test_wrong_password_is_rejected(): void
    {
        [$email] = $this->makeUser('admin');
        $this->postJson('/api/admin/auth/login', ['email' => $email, 'password' => 'wrong-password'])->assertStatus(401);
    }

    public function test_customers_cannot_log_into_admin(): void
    {
        [$email, $pass] = $this->makeUser('customer');
        $this->postJson('/api/admin/auth/login', ['email' => $email, 'password' => $pass])->assertStatus(403);
    }

    public function test_super_admin_sees_full_catalogue_on_dashboard(): void
    {
        $auth = $this->loginAs('admin');
        $total = DB::table('Watch')->count();
        $res = $this->getJson('/api/admin/products?perPage=500', $auth)->assertOk();
        $this->assertSame($total, $res->json('total') ?? count($res->json('items') ?? $res->json('data') ?? []));
        $this->getJson('/api/admin/dashboard', $auth)->assertOk();
    }

    public function test_chat_support_role_is_limited(): void
    {
        $auth = $this->loginAs('chat_support');
        $this->getJson('/api/admin/products', $auth)->assertStatus(403);
        $this->getJson('/api/admin/chats', $auth)->assertOk();
    }

    public function test_website_settings_validate_google_ids_and_render_tags(): void
    {
        $auth = $this->loginAs('admin');
        $base = ['storeName' => 'Novette Watches', 'contactEmail' => 'novettewatches@gmail.com', 'supportPhone' => '+1 000 000 0000'];

        $this->putJson('/api/admin/settings/website', $base + ['gaMeasurementId' => 'not-an-id'], $auth)->assertStatus(422);
        $this->putJson('/api/admin/settings/website', $base + ['gaMeasurementId' => 'G-TEST12345', 'searchConsoleCode' => 'abc_DEF-123'], $auth)->assertOk();

        $this->get('/')->assertOk()
            ->assertSee('googletagmanager.com/gtag/js?id=G-TEST12345', false)
            ->assertSee('<meta name="google-site-verification" content="abc_DEF-123">', false);
    }
}
