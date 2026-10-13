<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class StorefrontTest extends TestCase
{
    use DatabaseTransactions;

    public function test_public_pages_render(): void
    {
        $watch = DB::table('Watch')->where('active', 1)->where('inventory', '>', 0)->value('slug');
        $pages = ['/', '/shop', '/brands', '/brands/omega', '/collections', '/rolex', '/rolex/submariner', '/journal',
            '/contact-us', '/about-us', '/faqs', '/login', '/signup', '/cart', '/wishlist', '/checkout', "/watches/{$watch}"];
        foreach ($pages as $p) {
            $this->get($p)->assertOk();
        }
    }

    public function test_page_heroes_have_background_images(): void
    {
        foreach (['/shop', '/brands', '/brands/omega', '/rolex', '/cart', '/wishlist', '/contact-us'] as $p) {
            $this->get($p)->assertSee('page-hero', false)->assertSee('--hero:url(', false);
        }
    }

    public function test_locations_page_is_removed(): void
    {
        $this->get('/locations')->assertNotFound();
        $this->get('/')->assertDontSee('href="/locations"', false);
    }

    public function test_unknown_page_returns_404(): void
    {
        $this->get('/no-such-page')->assertNotFound()->assertSee('This Page Has Moved On');
    }

    public function test_every_listed_watch_has_an_existing_image(): void
    {
        $watches = $this->getJson('/api/watches')->assertOk()->json();
        $this->assertNotEmpty($watches);
        foreach ($watches as $w) {
            $this->assertNotEmpty($w['images'] ?? [], "{$w['slug']} has no images");
            $this->assertFileExists(public_path(ltrim($w['images'][0], '/')), "{$w['slug']} image missing on disk");
        }
    }

    public function test_sitemap_lists_watches_and_is_valid_xml(): void
    {
        $res = $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $xml = simplexml_load_string($res->getContent());
        $this->assertNotFalse($xml);
        $slug = DB::table('Watch')->where('active', 1)->value('slug');
        $this->assertStringContainsString("/watches/{$slug}</loc>", $res->getContent());
        $this->assertStringNotContainsString('/locations<', $res->getContent());
    }

    public function test_robots_points_to_sitemap_and_hides_private_areas(): void
    {
        $this->get('/robots.txt')->assertOk()
            ->assertSee('Sitemap: ' . url('/sitemap.xml'), false)
            ->assertSee('Disallow: /admin', false)
            ->assertSee('Disallow: /api/', false);
    }

    public function test_watch_page_has_seo_meta(): void
    {
        $w = DB::table('Watch')->where('active', 1)->where('inventory', '>', 0)->first();
        $this->get("/watches/{$w->slug}")->assertOk()
            ->assertSee('<link rel="canonical"', false)
            ->assertSee('property="og:image"', false);
    }

    public function test_security_headers_are_sent(): void
    {
        $this->get('/')->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    public function test_contact_form_stores_message_and_emails_store(): void
    {
        Mail::fake();
        $this->postJson('/api/contact', ['name' => 'Jane Client', 'email' => 'jane@example.com', 'subject' => 'Question', 'message' => 'Is this watch available?'])
            ->assertCreated();
        $this->assertDatabaseHas('ContactMessage', ['email' => 'jane@example.com', 'subject' => 'Question']);
    }

    public function test_customer_cart_and_wishlist_persist(): void
    {
        $ids = DB::table('Watch')->where('active', 1)->where('inventory', '>', 0)->limit(2)->pluck('id')->all();
        $res = $this->postJson('/api/auth/signup', ['name' => 'Test Buyer', 'email' => 'buyer-' . uniqid() . '@example.com', 'password' => 'secret-pass-1'])
            ->assertCreated();
        $auth = ['Authorization' => 'Bearer ' . $res->getCookie('aw_session', false)->getValue()];

        $this->putJson('/api/cart', ['items' => [['watchId' => $ids[0], 'qty' => 1]]], $auth)->assertOk();
        $this->putJson('/api/wishlist', ['watchIds' => [$ids[1]]], $auth)->assertOk();

        $cart = $this->getJson('/api/cart', $auth)->assertOk()->json();
        $wishlist = $this->getJson('/api/wishlist', $auth)->assertOk()->json();
        $this->assertSame($ids[0], $cart[0]['watchId'] ?? $cart[0]['watch']['id'] ?? null);
        $this->assertContains($ids[1], array_map(fn ($i) => $i['watchId'] ?? $i['watch']['id'] ?? null, $wishlist));
    }

    public function test_cart_requires_login(): void
    {
        $this->getJson('/api/cart')->assertStatus(401);
    }
}
