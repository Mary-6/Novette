# Deploying on shared hosting (cPanel, e.g. Blistra)

## Requirements
- PHP **8.1+** (cPanel → Select PHP Version) with extensions: pdo_mysql, mbstring,
  openssl, tokenizer, xml, ctype, json, bcmath, fileinfo, curl.
- A MySQL database + user (cPanel → MySQL Databases; assign the user ALL privileges).

## Steps
1. Upload the repo (or `git clone`) into e.g. `~/novette` — **not** inside `public_html`.
2. Set the domain's **document root** to `<project>/public` (cPanel → Domains).
   If you can't change it, put this in `public_html/.htaccess` instead:
   ```apache
   RewriteEngine On
   RewriteRule ^(.*)$ /novette/public/$1 [L]
   ```
3. Copy `.env.production.example` to `.env` (or paste the ready-made env file) and fill
   in `DB_*`, then either run `php artisan key:generate` or paste a generated
   `APP_KEY=base64:...`.
4. Install dependencies: `composer install --no-dev --optimize-autoloader`
   (cPanel → Terminal/SSH). If the host has no composer/SSH, run it locally and upload
   the `vendor/` folder.
5. Import the data: `php artisan migrate --seed` (creates tables, catalogue, admin user).
6. Permissions: `chmod -R 775 storage bootstrap/cache`.
7. `php artisan config:cache route:cache view:cache`.
8. Cron (cPanel → Cron Jobs), every minute:
   `php /home/<user>/novette/artisan schedule:run >> /dev/null 2>&1` (daily DB backups).

## If you see a 500 error
Read `storage/logs/laravel.log` — the last error is the cause. Usual suspects:
missing `vendor/`, missing `APP_KEY`, wrong `DB_*` values, PHP < 8.1, or
`storage/` not writable.
