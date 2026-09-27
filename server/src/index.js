import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from './db.js';
import { createHash } from 'crypto';
import {
  authMiddleware,
  issueSession,
  destroySession,
  requireAuth,
  requireAdmin,
  makeToken,
} from './auth.js';
import { sendMail } from './mail.js';

const makeTokenHash = (t) => createHash('sha256').update(t).digest('hex');

const app = express();
app.use(cors({ origin: process.env.APP_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  emailVerified: Boolean(u.emailVerifiedAt),
});

const wrap = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((e) => {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  });

const emailSchema = z.string().email();

/* ---------- Watches / catalogue ---------- */

app.get(
  '/api/watches',
  wrap(async (req, res) => {
    const { q, brand, type, gender, condition, min, max, sort } = req.query;
    const where = { inventory: { gt: 0 } };
    if (q)
      where.OR = ['model', 'reference', 'brandSlug', 'nickname'].map((f) => ({
        [f]: { contains: String(q), mode: 'insensitive' },
      }));
    if (brand) where.brandSlug = String(brand);
    if (type) where.type = String(type);
    if (gender) where.gender = String(gender);
    if (condition) where.condition = String(condition);
    if (min || max) where.price = { gte: Number(min) || 0, lte: max ? Number(max) : 2e9 };
    const orderBy =
      sort === 'price-asc'
        ? { price: 'asc' }
        : sort === 'price-desc'
          ? { price: 'desc' }
          : sort === 'newest'
            ? { addedAt: 'desc' }
            : { popularity: 'desc' };
    res.json(await prisma.watch.findMany({ where, orderBy }));
  })
);

app.get(
  '/api/watches/:slug',
  wrap(async (req, res) => {
    const watch = await prisma.watch.findUnique({ where: { slug: req.params.slug } });
    if (!watch) return res.status(404).json({ error: 'Not found' });
    res.json({ ...watch, available: watch.inventory > 0 });
  })
);

/* ---------- Auth ---------- */

const credentials = z.object({
  name: z.string().trim().min(2).optional(),
  email: emailSchema,
  password: z.string().min(8),
  remember: z.boolean().default(true),
});

app.post(
  '/api/auth/signup',
  wrap(async (req, res) => {
    const parsed = credentials.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: 'Invalid input', issues: parsed.error.issues });
    const { name, email, password, remember } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(409).json({ error: 'An account already exists for that email' });
    const user = await prisma.user.create({
      data: {
        name: name || email.split('@')[0],
        email,
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
    const { raw, hash } = makeToken();
    await prisma.authToken.create({
      data: {
        userId: user.id,
        kind: 'verify_email',
        tokenHash: hash,
        expiresAt: new Date(Date.now() + 86400e3),
      },
    });
    await sendMail({
      to: email,
      subject: 'Verify your Aurelian Watches account',
      html: `<p>Welcome to Aurelian Watches, ${user.name}.</p><p>Verify your email: <a href="${process.env.APP_URL}/verify-email?token=${raw}">Confirm account</a></p>`,
    });
    await issueSession(res, user.id, remember);
    res.status(201).json({ user: publicUser(user) });
  })
);

app.post(
  '/api/auth/login',
  wrap(async (req, res) => {
    const parsed = credentials.omit({ name: true }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
    const { email, password, remember } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: 'Invalid email or password' });
    await issueSession(res, user.id, remember);
    res.json({ user: publicUser(user) });
  })
);

app.post(
  '/api/auth/logout',
  wrap(async (req, res) => {
    await destroySession(req.cookies?.aw_session);
    res.clearCookie('aw_session');
    res.json({ ok: true });
  })
);

app.get(
  '/api/auth/me',
  wrap(async (req, res) => {
    res.json({ user: req.user ? publicUser(req.user) : null });
  })
);

app.post(
  '/api/auth/forgot-password',
  wrap(async (req, res) => {
    const email = emailSchema.safeParse(req.body.email);
    if (email.success) {
      const user = await prisma.user.findUnique({ where: { email: email.data } });
      if (user) {
        const { raw, hash } = makeToken();
        await prisma.authToken.create({
          data: {
            userId: user.id,
            kind: 'reset_password',
            tokenHash: hash,
            expiresAt: new Date(Date.now() + 3600e3),
          },
        });
        await sendMail({
          to: email.data,
          subject: 'Reset your Aurelian Watches password',
          html: `<p>Reset link (valid one hour): <a href="${process.env.APP_URL}/reset-password?token=${raw}">Reset password</a></p>`,
        });
      }
    }
    res.json({ ok: true });
  })
);

app.post(
  '/api/auth/reset-password',
  wrap(async (req, res) => {
    const parsed = z.object({ token: z.string(), password: z.string().min(8) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
    const hash = makeTokenHash(parsed.data.token);
    const tok = await prisma.authToken.findFirst({
      where: {
        tokenHash: hash,
        kind: 'reset_password',
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!tok) return res.status(400).json({ error: 'Reset link is invalid or expired' });
    await prisma.$transaction([
      prisma.user.update({
        where: { id: tok.userId },
        data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) },
      }),
      prisma.authToken.update({ where: { id: tok.id }, data: { usedAt: new Date() } }),
      prisma.session.deleteMany({ where: { userId: tok.userId } }),
    ]);
    res.json({ ok: true });
  })
);

app.post(
  '/api/auth/verify-email',
  wrap(async (req, res) => {
    const hash = makeTokenHash(String(req.body.token || ''));
    const tok = await prisma.authToken.findFirst({
      where: { tokenHash: hash, kind: 'verify_email', usedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!tok) return res.status(400).json({ error: 'Verification link is invalid or expired' });
    await prisma.$transaction([
      prisma.user.update({ where: { id: tok.userId }, data: { emailVerifiedAt: new Date() } }),
      prisma.authToken.update({ where: { id: tok.id }, data: { usedAt: new Date() } }),
    ]);
    res.json({ ok: true });
  })
);

/* ---------- Cart & wishlist sync ---------- */

app.get(
  '/api/cart',
  requireAuth,
  wrap(async (req, res) => {
    res.json(
      await prisma.cartItem.findMany({
        where: { userId: req.user.id },
        include: { watch: true },
      })
    );
  })
);

app.put(
  '/api/cart',
  requireAuth,
  wrap(async (req, res) => {
    const items = z
      .array(z.object({ watchId: z.string(), qty: z.number().int().min(1).max(10) }))
      .parse(req.body.items || []);
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { userId: req.user.id } }),
      prisma.cartItem.createMany({
        data: items.map((i) => ({ userId: req.user.id, watchId: i.watchId, qty: i.qty })),
      }),
    ]);
    res.json({ ok: true });
  })
);

app.get(
  '/api/wishlist',
  requireAuth,
  wrap(async (req, res) => {
    res.json(
      await prisma.wishlistItem.findMany({
        where: { userId: req.user.id },
        include: { watch: true },
      })
    );
  })
);

app.put(
  '/api/wishlist',
  requireAuth,
  wrap(async (req, res) => {
    const watchIds = z.array(z.string()).parse(req.body.watchIds || []);
    await prisma.$transaction([
      prisma.wishlistItem.deleteMany({ where: { userId: req.user.id } }),
      prisma.wishlistItem.createMany({
        data: watchIds.map((watchId) => ({ userId: req.user.id, watchId })),
      }),
    ]);
    res.json({ ok: true });
  })
);

/* ---------- Orders ---------- */

const orderSchema = z.object({
  email: emailSchema,
  customerName: z.string().min(2),
  shippingMethod: z.enum(['courier', 'express']),
  paymentMethod: z.enum(['card', 'wire']),
  address: z.object({
    address: z.string().min(3),
    city: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().min(1),
  }),
  items: z.array(z.object({ watchId: z.string(), qty: z.number().int().min(1) })).min(1),
});

const SHIPPING = { courier: 0, express: 250 };

app.get('/api/shipping-rates', (_req, res) =>
  res.json([
    { id: 'courier', label: 'Insured Courier', hint: '3–5 business days', price: 0 },
    {
      id: 'express',
      label: 'Express Overnight',
      hint: 'Next business day',
      price: SHIPPING.express,
    },
  ])
);

app.post(
  '/api/orders',
  wrap(async (req, res) => {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: 'Invalid order', issues: parsed.error.issues });
    const d = parsed.data;
    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const lines = [];
      for (const item of d.items) {
        const watch = await tx.watch.findUnique({ where: { id: item.watchId } });
        if (!watch || watch.inventory < item.qty)
          throw Object.assign(new Error(`Out of stock: ${item.watchId}`), { status: 409 });
        await tx.watch.update({
          where: { id: watch.id },
          data: { inventory: watch.inventory - item.qty },
        });
        subtotal += watch.price * item.qty;
        lines.push({
          watchId: watch.id,
          model: watch.model,
          reference: watch.reference,
          brand: watch.brandSlug,
          qty: item.qty,
          price: watch.price,
        });
      }
      const shippingPrice =
        subtotal > 5000 && d.shippingMethod === 'courier' ? 0 : SHIPPING[d.shippingMethod];
      return tx.order.create({
        data: {
          number: `AW-${String(Math.floor(100000 + Math.random() * 900000))}`,
          userId: req.user?.id || null,
          email: d.email,
          customerName: d.customerName,
          shippingMethod: d.shippingMethod,
          shippingPrice,
          subtotal,
          total: subtotal + shippingPrice,
          paymentMethod: d.paymentMethod,
          address: d.address,
          items: { create: lines },
        },
        include: { items: true },
      });
    });
    await sendMail({
      to: order.email,
      subject: `Order ${order.number} confirmed — Aurelian Watches`,
      html: `<p>Thank you, ${order.customerName}.</p><p>Your order <b>${order.number}</b> totalling $${order.total.toLocaleString()} is confirmed. We will email tracking once your timepiece ships fully insured.</p>`,
    });
    res.status(201).json({ order });
  })
);

app.get(
  '/api/orders',
  requireAuth,
  wrap(async (req, res) => {
    res.json(
      await prisma.order.findMany({
        where: { userId: req.user.id },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      })
    );
  })
);

app.get(
  '/api/orders/:number',
  wrap(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { number: req.params.number },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ error: 'Not found' });
    const owner = req.user && (req.user.id === order.userId || req.user.role === 'admin');
    if (!owner && order.email !== req.query.email)
      return res.status(403).json({ error: 'Provide the order email to view this order' });
    res.json(order);
  })
);

/* ---------- Contact & newsletter ---------- */

app.post(
  '/api/contact',
  wrap(async (req, res) => {
    const parsed = z
      .object({
        name: z.string().min(2),
        email: emailSchema,
        subject: z.string().optional(),
        message: z.string().min(10),
      })
      .safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
    const msg = await prisma.contactMessage.create({ data: parsed.data });
    await sendMail({
      to: 'concierge@aurelianwatches.com',
      subject: `Contact: ${parsed.data.subject || 'General enquiry'}`,
      html: `<p>From ${parsed.data.name} &lt;${parsed.data.email}&gt;</p><p>${parsed.data.message}</p>`,
    });
    res.status(201).json({ id: msg.id });
  })
);

app.post(
  '/api/newsletter',
  wrap(async (req, res) => {
    const email = emailSchema.safeParse(req.body.email);
    if (!email.success) return res.status(400).json({ error: 'Valid email required' });
    await prisma.newsletterSubscriber.upsert({
      where: { email: email.data },
      update: {},
      create: { email: email.data },
    });
    res.status(201).json({ ok: true });
  })
);

/* ---------- Admin ---------- */

app.get(
  '/api/admin/watches',
  requireAdmin,
  wrap(async (_req, res) =>
    res.json(await prisma.watch.findMany({ orderBy: { brandSlug: 'asc' } }))
  )
);

app.patch(
  '/api/admin/watches/:id',
  requireAdmin,
  wrap(async (req, res) => {
    const data = z
      .object({
        price: z.number().int().optional(),
        inventory: z.number().int().min(0).optional(),
        isFeatured: z.boolean().optional(),
        condition: z.string().optional(),
        description: z.string().optional(),
        popularity: z.number().int().optional(),
      })
      .parse(req.body);
    res.json(await prisma.watch.update({ where: { id: req.params.id }, data }));
  })
);

app.get(
  '/api/admin/orders',
  requireAdmin,
  wrap(async (_req, res) =>
    res.json(
      await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } })
    )
  )
);

app.patch(
  '/api/admin/orders/:id',
  requireAdmin,
  wrap(async (req, res) => {
    const { status } = z.object({ status: z.string() }).parse(req.body);
    res.json(await prisma.order.update({ where: { id: req.params.id }, data: { status } }));
  })
);

app.get(
  '/api/admin/stats',
  requireAdmin,
  wrap(async (_req, res) => {
    const [watches, orders, users, messages, subscribers] = await Promise.all([
      prisma.watch.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.contactMessage.count(),
      prisma.newsletterSubscriber.count(),
    ]);
    res.json({ watches, orders, users, messages, subscribers });
  })
);

app.get(
  '/api/admin/messages',
  requireAdmin,
  wrap(async (_req, res) =>
    res.json(await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } }))
  )
);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`Aurelian API on http://localhost:${port}`));
