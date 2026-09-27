import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageHero from '../components/layout/PageHero';
import Button from '../components/ui/Button';
import { api } from '../lib/api';

const inputCls =
  'w-full border border-stone/40 bg-transparent px-3 py-3 text-sm outline-none transition focus:border-gold';

export function VerifyEmail() {
  const [params] = useSearchParams();
  const [state, setState] = useState('Verifying…');
  useEffect(() => {
    api
      .verifyEmail(params.get('token'))
      .then(() => setState('Email verified — welcome aboard.'))
      .catch((e) => setState(e.message || 'Verification failed'));
  }, [params]);
  return (
    <>
      <PageHero eyebrow="Account" title="Email Verification" />
      <section className="py-24 text-center">
        <p className="text-sm text-graphite">{state}</p>
        <Button to="/login" className="mt-8">
          Sign in
        </Button>
      </section>
    </>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.resetPassword({ token: params.get('token'), password });
      navigate('/login', { state: { reset: true } });
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <>
      <PageHero eyebrow="Account" title="Set a New Password" />
      <section className="py-24">
        <form onSubmit={submit} className="container-x max-w-md space-y-5">
          {error && (
            <p className="border border-red-700/30 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </p>
          )}
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (8+ characters)"
            className={inputCls}
          />
          <Button type="submit" className="w-full">
            Reset password
          </Button>
        </form>
      </section>
    </>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.forgotPassword(email);
    } catch {
      /* still show confirmation — no email enumeration */
    }
    setSent(true);
  };
  return (
    <>
      <PageHero eyebrow="Account" title="Reset Your Password" />
      <section className="py-24">
        {sent ? (
          <p className="container-x max-w-md text-sm text-graphite">
            If an account exists for that email, a reset link is on its way.
          </p>
        ) : (
          <form onSubmit={submit} className="container-x max-w-md space-y-5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className={inputCls}
            />
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </form>
        )}
      </section>
    </>
  );
}
