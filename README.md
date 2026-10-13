# Novette Watches

Luxury watch storefront — "Fine Timepieces, Est. 1987". New, unworn, pre-owned and
vintage watches across 15 maisons, structured around a Rolex-centric hub.
Buying only: orders are concierge requests, there are no online payments and no
watch-selling features.

## Stack

- Laravel 10 / PHP 8.1 — Blade views, session auth
- Vanilla JavaScript (`api/public/app.js`, `admin.js`, `admin-pages-*.js`)
- MySQL / MariaDB
- Live chat: Smartsupp (set `SMARTSUPP_KEY` in `.env`)

## Commands

```bash
cd api
composer install
cp .env.example .env && php artisan key:generate   # then fill in DB + mail settings
php artisan migrate
php artisan serve --port=4000                      # http://localhost:4000
php artisan test                                   # PHPUnit test suite (novette_test DB)
php artisan schedule:run                           # run every minute on the host (daily DB backups)
```

## Layout

- `api/` — the entire application (routes, controllers, Blade views, public assets, tests)
- `api/.env.production.example` — production environment template
- Storefront: `/`; admin console: `/admin` (login at `/admin/login`)
