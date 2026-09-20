const tones = {
  New: 'bg-ink text-ivory',
  Unworn: 'bg-gold text-ink',
  'In Stock': 'bg-emerald-900/10 text-emerald-900',
  Reserved: 'bg-amber-700/10 text-amber-800',
  'Coming Soon': 'bg-graphite/10 text-graphite',
};

export default function Badge({ children, className = '' }) {
  const tone = tones[children] || 'bg-sand text-ink';
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${tone} ${className}`}
    >
      {children}
    </span>
  );
}
