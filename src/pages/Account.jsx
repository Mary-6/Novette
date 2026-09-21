import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import PageHero from '../components/layout/PageHero';
import useReveal from '../hooks/useReveal';

const inputCls =
  'w-full border border-stone/40 bg-transparent px-4 py-3.5 text-sm outline-none transition focus:border-gold';

function AuthForm({ mode }) {
  const isSignup = mode === 'signup';
  const [form, setForm] = useState({ name: '', email: '', password: '', remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (isSignup && form.name.trim().length < 2) errs.name = 'Required';
    if (!/.+@.+\..+/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.password.length < 8) errs.password = 'At least 8 characters';
    setErrors(errs);
    if (!Object.keys(errs).length) setDone(true);
  };

  if (done) {
    return (
      <div className="border border-gold/50 bg-sand p-8 text-center">
        <p className="heading-display text-2xl">Accounts are coming soon.</p>
        <p className="mt-3 text-sm text-graphite">
          This is a demo — no account was created and nothing was sent. Our concierge can set up
          your file by phone or email in the meantime.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {isSignup && (
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-graphite">
            Name
          </label>
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-graphite">
          Email
        </label>
        <input
          className={inputCls}
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-graphite">
          Password
        </label>
        <div className="relative">
          <input
            className={`${inputCls} pr-12`}
            type={showPassword ? 'text' : 'password'}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-graphite transition hover:text-gold"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-700">{errors.password}</p>}
      </div>
      {!isSignup && (
        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2.5 text-graphite">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })}
              className="h-4 w-4 cursor-pointer appearance-none border border-stone/60 bg-transparent transition checked:border-gold checked:bg-gold"
            />
            Remember me
          </label>
          <Link to="/contact-us" className="text-goldDark underline underline-offset-2">
            Forgot password?
          </Link>
        </div>
      )}
      <button type="submit" className="btn-primary w-full">
        {isSignup ? 'Create account' : 'Log in'}
      </button>
    </form>
  );
}

export function Login() {
  useReveal([]);
  return (
    <>
      <PageHero eyebrow="Your Account" title="Welcome back.">
        <p>Log in for wishlists, saved searches and order history.</p>
      </PageHero>
      <section className="py-20">
        <div className="container-x max-w-md">
          <AuthForm mode="login" />
          <p className="mt-6 text-center text-sm text-graphite">
            New to Aurelian Watches?{' '}
            <Link to="/signup" className="text-goldDark underline underline-offset-2">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

export function Signup() {
  useReveal([]);
  return (
    <>
      <PageHero eyebrow="Your Account" title="Join the Aurelian List.">
        <p>Create an account to save watches, manage alerts and check out faster.</p>
      </PageHero>
      <section className="py-20">
        <div className="container-x max-w-md">
          <AuthForm mode="signup" />
          <p className="mt-6 text-center text-sm text-graphite">
            Already registered?{' '}
            <Link to="/login" className="text-goldDark underline underline-offset-2">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
