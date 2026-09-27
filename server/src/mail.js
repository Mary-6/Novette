import nodemailer from 'nodemailer';
import { prisma } from './db.js';

const transport = process.env.SMTP_URL ? nodemailer.createTransport(process.env.SMTP_URL) : null;

export const DEFAULT_TEMPLATES = {
  order_confirm: {
    subject: 'Order {{order.number}} confirmed — Lumont Watches',
    html: '<p>Thank you, {{order.customerName}}.</p><p>Your order <b>{{order.number}}</b> totalling ${{order.total}} is confirmed. We will email tracking once your timepiece ships fully insured.</p>',
  },
  verify_email: {
    subject: 'Verify your Lumont Watches account',
    html: '<p>Welcome to Lumont Watches, {{user.name}}.</p><p>Verify your email: <a href="{{link}}">Confirm account</a></p>',
  },
  reset_password: {
    subject: 'Reset your Lumont Watches password',
    html: '<p>Reset link (valid one hour): <a href="{{link}}">Reset password</a></p>',
  },
  order_shipped: {
    subject: 'Your order {{order.number}} has shipped — Lumont Watches',
    html: '<p>Dear {{order.customerName}},</p><p>Your order <b>{{order.number}}</b> has been dispatched fully insured. Tracking reference: <b>{{order.trackingNumber}}</b>.</p><p>A concierge remains at your service.</p>',
  },
};

function render(tpl, vars) {
  return tpl.replace(
    /\{\{([^}]+)\}\}/g,
    (_, path) =>
      path
        .trim()
        .split('.')
        .reduce((o, k) => o?.[k], vars) ?? ''
  );
}

export async function mailTemplate(key, vars) {
  const tpl = (await prisma.emailTemplate.findUnique({ where: { key } })) || DEFAULT_TEMPLATES[key];
  return { subject: render(tpl.subject, vars), html: render(tpl.html, vars) };
}

export async function sendMail({ to, subject, html }) {
  if (!transport) {
    console.log(`[mail] (no SMTP_URL — logged only) to=${to} subject=${subject}`);
    console.log(
      html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 400)
    );
    return { delivered: false, logged: true };
  }
  await transport.sendMail({
    from: process.env.MAIL_FROM || 'Lumont Watches <lumontwatches@gmail.com>',
    to,
    subject,
    html,
  });
  return { delivered: true };
}
