import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { formatPrice } from '../data/utils';
import PageHero from '../components/layout/PageHero';
import useReveal from '../hooks/useReveal';

const inputCls =
  'w-full border border-stone/40 bg-transparent px-4 py-3.5 text-sm outline-none transition focus:border-gold';

function AuthForm({ mode }) {
  const isSignup = mode === 'signup';
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (isSignup && form.name.trim().length < 2) errs.name = 'Required';
    if (!/.+@.+\..+/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.password.length < 8) errs.password = 'At least 8 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const action = isSignup ? signup : login;
    try {
      await action({
        name: form.name,
        email: form.email,
        password: form.password,
        remember: isSignup ? true : form.remember,
      });
      navigate(location.state?.from || '/', { state: location.state });
    } catch (e) {
      setErrors({ form: e.message || 'Sign in failed' });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {errors.form && (
        <p className="border border-red-700/30 bg-red-50 px-4 py-3 text-xs text-red-700">
          {errors.form}
        </p>
      )}
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
          <Link to="/forgot-password" className="text-goldDark underline underline-offset-2">
            Forgot password?
          </Link>
        </div>
      )}
      <button type="submit" className="btn-primary w-full">
        {isSignup ? 'Create account' : 'Log in'}
      </button>
      <p className="text-center text-xs text-stone">
        Demo account, details are stored only in this browser.
      </p>
    </form>
  );
}

function OrderHistory() {
  const [orders, setOrders] = useState(null);
  useEffect(() => {
    api
      .orders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);
  if (orders === null) return <p className="py-4 text-sm text-graphite">Loading orders…</p>;
  if (orders.length === 0)
    return <p className="py-4 text-sm text-graphite">No orders yet.</p>;
  return (
    <div className="mt-6 space-y-3 text-left">
      {orders.map((o) => (
        <div key={o.id} className="border border-stone/30 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{o.number}</span>
            <span className="rounded-full border border-gold/60 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] text-goldDark">
              {o.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-graphite">
            {new Date(o.createdAt).toLocaleDateString()} · {o.items?.length ?? ''} item(s) ·{' '}
            {formatPrice(o.total)}
          </p>
          {o.trackingNumber && (
            <p className="mt-1 text-xs text-graphite">
              Tracking: <span className="font-medium text-ink">{o.trackingNumber}</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function Login() {
  useReveal([]);
  const { user, isAuthed, logout } = useAuth();
  const location = useLocation();
  return (
    <>
      <PageHero eyebrow="Your Account" title="Welcome back.">
        <p>Log in for wishlists, saved searches and order history.</p>
      </PageHero>
      <section className="py-20">
        <div className="container-x max-w-md">
          {isAuthed ? (
            <div className="border border-gold/50 bg-sand p-8 text-center">
              <p className="heading-display text-2xl">You're signed in as {user.name}.</p>
              {!user.demo && (
                <div className="mt-6">
                  <p className="eyebrow mb-2 text-left">Order history</p>
                  <OrderHistory />
                </div>
              )}
              <div className="mt-6 flex flex-col gap-3">
                <Link to="/" className="btn-primary">
                  Continue shopping
                </Link>
                <button type="button" onClick={logout} className="btn-outline">
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <>
              {location.state?.openChat && (
                <p className="mb-6 border border-gold/60 bg-sand px-4 py-3 text-sm text-graphite">
                  Please log in to start a live chat with our concierge.
                </p>
              )}
              <AuthForm mode="login" />
            </>
          )}
          <p className="mt-6 text-center text-sm text-graphite">
            New to Lumont Watches?{' '}
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
      <PageHero eyebrow="Your Account" title="Join the Lumont List.">
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
