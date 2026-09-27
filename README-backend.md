# Aurelian Watches — backend

Express + Prisma + Postgres API in `server/`.

## Run locally

```bash
docker run -d --name aurelian-pg -e POSTGRES_USER=aurelian -e POSTGRES_PASSWORD=aurelian -e POSTGRES_DB=aurelian -p 5432:5432 postgres:16
cp server/.env.example .env   # fill SMTP_URL for real emails (logs to console otherwise)
npm run db:push && npm run db:seed
npm run server                # API on :4000
npm run dev                   # Vite on :5173, proxies /api → :4000
```

## Included

- Catalogue: `GET /api/watches` (q/brand/type/gender/condition/price/sort), `GET /api/watches/:slug`, `inventory` decremented on orders.
- Auth: signup/login/logout/me (httpOnly `aw_session` cookie, remember-me = 30d vs 1d), forgot/reset password, email verification — tokens hashed, single-use.
- Cart/wishlist: `GET|PUT /api/cart`, `/api/wishlist` — the React contexts merge localStorage ⇄ server on login and push changes live.
- Orders: `POST /api/orders` (validates stock, decrements, emails confirmation), `GET /api/orders`, `GET /api/orders/:number?email=…`.
- `POST /api/contact`, `POST /api/newsletter`, `GET /api/shipping-rates`.
- Admin (role=admin): stats, watch price/inventory/featured edit, order status, messages — UI at `/admin`.
- Admin seed account: `admin@aurelianwatches.com` / `Aurelian#Admin1` (change for production).
- Frontend falls back to localStorage/demo mode when the API is unreachable.
