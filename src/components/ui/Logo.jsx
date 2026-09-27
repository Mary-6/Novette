export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22" stroke="#C9A24C" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="17.5" stroke="#C9A24C" strokeWidth="0.75" opacity="0.6" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = 24 + 19.5 * Math.sin(a);
        const y1 = 24 - 19.5 * Math.cos(a);
        const x2 = 24 + 22 * Math.sin(a);
        const y2 = 24 - 22 * Math.cos(a);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#C9A24C"
            strokeWidth={i % 3 === 0 ? 1.6 : 0.9}
          />
        );
      })}
      <path d="M18.5 32V16h2.4l9 12.5V16h2.6v16h-2.4l-9-12.5V32h-2.6Z" fill="#C9A24C" />
      <path
        d="M20 13l4-2.6 4 2.6"
        stroke="#C9A24C"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ size = 'md', className = '' }) {
  const text = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl sm:text-2xl';
  const mark = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  return (
    <div className={`flex shrink-0 select-none items-center gap-2.5 ${className}`}>
      <LogoMark className={mark} />
      <span className={`heading-display tracking-wide ${text}`}>
        Novette <span className="text-gold">Watches</span>
      </span>
    </div>
  );
}
