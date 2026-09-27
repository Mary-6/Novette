/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import watches from '../../data/watches';
import brands from '../../data/brands';
import { formatPrice } from '../../data/utils';
import WatchImage from '../watch/WatchImage';
import { LogoMark } from '../ui/Logo';
import { greeting, reply } from './concierge';
import { api } from '../../lib/api';

const brandName = (w) => brands.find((b) => b.slug === w.brandSlug)?.name || w.brandSlug;

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Bubble({ msg, onOption }) {
  const isBot = msg.from === 'bot';
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed ${
          isBot ? 'border border-stone/30 bg-sand text-ink' : 'bg-ink text-ivory'
        }`}
      >
        <p className="whitespace-pre-wrap">{msg.text}</p>
        {msg.products?.length > 0 && (
          <div className="mt-3 space-y-2">
            {msg.products.map((slug) => {
              const w = watches.find((x) => x.slug === slug);
              if (!w) return null;
              return (
                <Link
                  key={slug}
                  to={`/watches/${slug}`}
                  className="flex items-center gap-3 border border-stone/30 bg-ivory p-2 transition hover:border-gold"
                >
                  <WatchImage watch={w} className="h-14 w-14 shrink-0 bg-sand object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs uppercase tracking-[0.15em] text-graphite">
                      {brandName(w)}
                    </span>
                    <span className="block truncate text-sm font-medium">{w.model}</span>
                    <span className="block text-xs text-goldDark">{formatPrice(w.price)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
        {msg.links?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {msg.links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-xs uppercase tracking-[0.15em] text-goldDark underline underline-offset-2"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
        {msg.options?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {msg.options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => onOption(o)}
                className="rounded-full border border-gold px-3 py-1.5 text-xs text-goldDark transition hover:bg-gold hover:text-ink"
              >
                {o}
              </button>
            ))}
          </div>
        )}
        <p className={`mt-1.5 text-[10px] ${isBot ? 'text-stone' : 'text-ivory/50'}`}>{msg.time}</p>
      </div>
    </div>
  );
}

export default function LiveChat() {
  const { user, isAuthed } = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const openRef = useRef(false);
  const serverRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const storageKey = user ? `aw-chat:${user.email}` : null;

  // Load persisted thread once a user is known; merge server thread when available
  useEffect(() => {
    if (!storageKey) {
      setMessages([]);
      return;
    }
    try {
      setMessages(JSON.parse(localStorage.getItem(storageKey)) || []);
    } catch {
      setMessages([]);
    }
    if (user?.demo) return;
    api
      .chatThread()
      .then((thread) => {
        serverRef.current = true;
        if (thread.length) {
          setMessages(
            thread.map((m) => ({
              from: m.from === 'concierge' ? 'bot' : 'user',
              text: m.body,
              time: new Date(m.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            }))
          );
        }
      })
      .catch(() => {});
    // Poll for concierge replies while logged in
    const poll = setInterval(() => {
      if (!serverRef.current) return;
      api
        .chatThread()
        .then((thread) => {
          setMessages((prev) => {
            const conciergeMsgs = thread
              .filter((m) => m.from === 'concierge')
              .map((m) => ({
                from: 'bot',
                text: m.body,
                time: new Date(m.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }));
            const prevConciergeCount = prev.filter((m) => m.from === 'bot' && m.server !== false).length;
            if (conciergeMsgs.length > prevConciergeCount) {
              const merged = [...prev];
              conciergeMsgs.slice(prevConciergeCount).forEach((m) => {
                merged.push({ ...m, server: true });
                if (!openRef.current) setUnread((n) => n + 1);
              });
              return merged;
            }
            return prev;
          });
        })
        .catch(() => {});
    }, 8000);
    return () => clearInterval(poll);
  }, [storageKey, user?.demo]);

  useEffect(() => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const botSay = useCallback((produce) => {
    setTyping(true);
    const delay = 700 + Math.random() * 700;
    setTimeout(() => {
      const r = produce();
      setTyping(false);
      setMessages((prev) => [...prev, { from: 'bot', time: timeNow(), ...r }]);
      if (!openRef.current) setUnread((n) => n + 1);
    }, delay);
  }, []);

  // Open panel after the login redirect
  useEffect(() => {
    if (isAuthed && sessionStorage.getItem('aw-chat-open') === '1') {
      sessionStorage.removeItem('aw-chat-open');
      setOpen(true);
    }
  }, [isAuthed]);

  // Send greeting when a fresh thread opens
  useEffect(() => {
    if (open && isAuthed && messages.length === 0 && !typing) {
      botSay(() => greeting(user));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAuthed]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      inputRef.current?.focus();
    }
  }, [open, messages, typing]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const launch = () => {
    if (!isAuthed) {
      sessionStorage.setItem('aw-chat-open', '1');
      navigate('/login', {
        state: { from: location.pathname + location.search, openChat: true },
      });
      return;
    }
    setOpen((o) => !o);
  };

  const send = (text) => {
    const msg = (text ?? draft).trim();
    if (!msg) return;
    setDraft('');
    setMessages((prev) => [...prev, { from: 'user', text: msg, time: timeNow() }]);
    if (serverRef.current) api.chatSend(msg).catch(() => {});
    botSay(() => reply(msg, { cart, wishlist, user }));
  };

  const autogrow = (el) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 4 * 22 + 20)}px`;
  };

  return (
    <>
      {open && isAuthed && (
        <div
          role="dialog"
          aria-label="Live chat"
          className="fixed inset-0 z-[55] flex h-full w-full flex-col border-stone/30 bg-ivory text-ink shadow-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[560px] sm:max-h-[calc(100vh-8rem)] sm:w-[380px] sm:max-w-[calc(100vw-2rem)] sm:rounded-sm sm:border"
        >
          <div className="flex items-center gap-3 bg-ink p-4 text-ivory">
            <LogoMark className="h-8 w-8 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="heading-display text-lg leading-tight">Veymont Concierge</p>
              <p className="flex items-center gap-1.5 text-[11px] text-ivory/60">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Typically replies in under a minute
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                if (storageKey) localStorage.removeItem(storageKey);
              }}
              className="text-[10px] uppercase tracking-[0.15em] text-ivory/60 underline-offset-2 transition hover:text-gold hover:underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-ivory/80 transition hover:text-gold"
            >
              <X size={18} />
            </button>
          </div>
          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <Bubble
                key={i}
                msg={
                  i === messages.length - 1 ||
                  m.from !== 'bot' ||
                  !messages.slice(i + 1).some((x) => x.from === 'bot')
                    ? m
                    : { ...m, options: undefined }
                }
                onOption={send}
              />
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 border border-stone/30 bg-sand px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-stone/30 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  autogrow(e.target);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Write a message…"
                aria-label="Message"
                className="max-h-28 w-full resize-none border border-stone/40 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={() => send()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center bg-ink text-ivory transition hover:bg-graphite"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-stone">
              A live concierge answers here 9am–9pm ET · veymontwatches@gmail.com
            </p>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={launch}
        aria-label={open ? 'Close live chat' : 'Open live chat'}
        className="fixed bottom-6 right-6 z-[55] flex items-center gap-2 rounded-full border border-gold/60 bg-ink px-5 py-3 text-ivory shadow-2xl transition hover:border-gold"
      >
        <span className="relative flex items-center">
          <MessageCircle size={18} />
          <span className="absolute -right-1 -top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
        </span>
        <span className="hidden text-xs uppercase tracking-[0.2em] sm:inline">Live Chat</span>
        {unread > 0 && !open && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-ink">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
