export default function SectionHeading({ eyebrow, title, action, light = false, className = '' }) {
  return (
    <div className={`mb-12 flex items-end justify-between gap-6 ${className}`}>
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2
          className={`heading-display text-3xl font-medium sm:text-4xl lg:text-5xl ${light ? 'text-ivory' : 'text-ink'}`}
        >
          {title}
        </h2>
      </div>
      {action && <div className="hidden shrink-0 sm:block">{action}</div>}
    </div>
  );
}
