import { describe, it, expect } from 'vitest';
import { DEFAULT_TEMPLATES } from '../server/src/mail.js';

const render = (tpl, vars) =>
  tpl.replace(/\{\{([^}]+)\}\}/g, (_, path) =>
    path
      .trim()
      .split('.')
      .reduce((o, k) => o?.[k], vars) ?? ''
  );

describe('mail templates', () => {
  it('has all required templates', () => {
    ['order_confirm', 'order_shipped', 'verify_email', 'reset_password'].forEach((k) =>
      expect(DEFAULT_TEMPLATES[k]).toBeTruthy()
    );
  });
  it('renders {{var}} placeholders', () => {
    const out = render(DEFAULT_TEMPLATES.order_confirm.subject, {
      order: { number: 'AW-123456' },
    });
    expect(out).toContain('AW-123456');
  });
  it('renders order_shipped tracking', () => {
    const out = render(DEFAULT_TEMPLATES.order_shipped.html, {
      order: { customerName: 'Jane', number: 'AW-1', trackingNumber: 'T123' },
    });
    expect(out).toContain('T123');
    expect(out).toContain('Jane');
  });
});
