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
      <path d="M24 7v3M41 24h-3M24 41v-3M7 24h3" stroke="#C9A24C" strokeWidth="1.5" />
      <path
        d="M16 14.5l8 18.5 8-18.5h-3.4L24 24.4l-4.6-9.9H16Z"
        fill="#C9A24C"
      />
      <circle cx="24" cy="24" r="1.4" fill="#C9A24C" />
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
        Veymont <span className="text-gold">Watches</span>
      </span>
    </div>
  );
}
