import nodemailer from 'nodemailer';

const transport = process.env.SMTP_URL ? nodemailer.createTransport(process.env.SMTP_URL) : null;

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
    from: process.env.MAIL_FROM || 'Aurelian Watches <concierge@aurelianwatches.com>',
    to,
    subject,
    html,
  });
  return { delivered: true };
}
