import { useState } from 'react';
import WatchArt from './WatchArt';
import WatchImage from './WatchImage';
import imageCredits from '../../data/imageCredits.json';

const VIEWS = [
  { key: 'front', label: 'Front' },
  { key: 'angle', label: 'Angle' },
  { key: 'detail', label: 'Dial' },
  { key: 'caseback', label: 'Caseback' },
];

export default function ProductGallery({ watch, art, engraving }) {
  const [active, setActive] = useState(0);
  const [showCredits, setShowCredits] = useState(false);
  const hasPhotos = watch?.images?.length > 0;
  const creds = imageCredits[watch?.slug] || [];

  if (!hasPhotos) {
    const view = VIEWS[active] ? VIEWS[active].key : 'front';
    return (
      <div>
        <div className="overflow-hidden bg-sand">
          <WatchArt art={art} view={view} engraving={engraving} className="aspect-square w-full" />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {VIEWS.map((v, i) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setActive(i)}
              className={`border bg-sand transition ${
                view === v.key ? 'border-gold' : 'border-transparent hover:border-stone/40'
              }`}
              aria-label={`${v.label} view`}
            >
              <WatchArt
                art={art}
                view={v.key}
                engraving={engraving}
                className="aspect-square w-full"
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden bg-sand">
        <WatchImage watch={watch} index={active} className="aspect-square w-full" />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {watch.images.map((img, i) => (
          <button
            key={img}
            type="button"
            onClick={() => setActive(i)}
            className={`border bg-sand transition ${
              active === i ? 'border-gold' : 'border-transparent hover:border-stone/40'
            }`}
            aria-label={`Photo ${i + 1}`}
          >
            <WatchImage watch={watch} index={i} className="aspect-square w-full" />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setShowCredits((s) => !s)}
        className="mt-3 text-[11px] uppercase tracking-[0.15em] text-stone underline-offset-4 transition hover:text-gold"
      >
        Photo credits {showCredits ? '–' : '+'}
      </button>
      {showCredits && (
        <ul className="mt-2 space-y-1.5 text-xs text-graphite">
          {creds.map((c, i) => (
            <li key={i}>
              Photo {i + 1}: {c.author} ·{' '}
              <a
                href={c.pageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-goldDark underline underline-offset-2"
              >
                {c.license}
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[11px] text-stone">
        Photos via Wikimedia Commons — representative of the model shown.
      </p>
    </div>
  );
}
