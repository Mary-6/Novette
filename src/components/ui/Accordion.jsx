import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone/25">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium uppercase tracking-[0.15em]">{title}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-6 text-sm leading-relaxed text-graphite">{children}</div>}
    </div>
  );
}

export default function Accordion({ items, className = '' }) {
  return (
    <div className={className}>
      {items.map((it, i) => (
        <AccordionItem key={i} title={it.title ?? it.q} defaultOpen={i === 0}>
          {it.body ?? it.a}
        </AccordionItem>
      ))}
    </div>
  );
}
