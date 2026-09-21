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
  const photoCount = watch?.images?.length || 0;
  const hasPhotos = (watch?.imageKinds || []).includes('photo');
  const creds = hasPhotos ? imageCredits[watch?.slug] || [] : [];

  // Real photos first, then WatchArt views fill to 4 slots.
  const slots = [
    ...(watch?.images || []).map((img, i) => ({
      type: watch?.imageKinds?.[i] === 'visualization' ? 'visualization' : 'photo',
      index: i,
      key: img,
    })),
    ...VIEWS.slice(0, Math.max(0, 8 - photoCount)).map((v, i) => ({
      type: 'art',
      view: v.key,
      label: v.label,
      key: v.key + i,
    })),
  ];
  const cur = slots[active] || slots[0];

  return (
    <div>
      <div className="relative overflow-hidden bg-sand">
        {cur?.type === 'photo' || cur?.type === 'visualization' ? (
          <WatchImage
            watch={watch}
            index={cur.index}
            eager={cur.index === 0}
            view={VIEWS[cur.index]?.label}
            className="aspect-square w-full"
          />
        ) : (
          <WatchArt
            art={art}
            view={cur?.view || 'front'}
            engraving={engraving}
            className="aspect-square w-full"
            label={`Illustrated representation of ${watch?.model || 'watch'}`}
          />
        )}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {slots.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive(i)}
            className={`border bg-sand transition ${
              active === i ? 'border-gold' : 'border-transparent hover:border-stone/40'
            }`}
            aria-label={
              s.type === 'art'
                ? `${s.label} view`
                : `${watch?.model || 'Watch'} — ${VIEWS[s.index]?.label || `View ${s.index + 1}`}`
            }
          >
            {s.type === 'photo' || s.type === 'visualization' ? (
              <WatchImage
                watch={watch}
                index={s.index}
                view={VIEWS[s.index]?.label}
                className="aspect-square w-full"
              />
            ) : (
              <WatchArt
                art={art}
                view={s.view}
                engraving={engraving}
                className="aspect-square w-full"
              />
            )}
          </button>
        ))}
      </div>
      {creds.length > 0 && (
        <button
          type="button"
          onClick={() => setShowCredits((s) => !s)}
          className="mt-3 text-[11px] uppercase tracking-[0.15em] text-stone underline-offset-4 transition hover:text-gold"
        >
          Photo credits {showCredits ? '–' : '+'}
        </button>
      )}
      {showCredits && creds.length > 0 && (
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
      {creds.length > 0 && (
        <p className="mt-2 text-[11px] text-stone">
          Photos via Wikimedia Commons — representative of the model shown.
        </p>
      )}
    </div>
  );
}
