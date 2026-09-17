import { useState } from 'react';
import WatchArt from './WatchArt';

const VIEWS = [
  { key: 'front', label: 'Front' },
  { key: 'angle', label: 'Angle' },
  { key: 'detail', label: 'Dial' },
  { key: 'caseback', label: 'Caseback' },
];

export default function ProductGallery({ art, engraving }) {
  const [view, setView] = useState('front');
  return (
    <div>
      <div className="overflow-hidden bg-sand">
        <WatchArt art={art} view={view} engraving={engraving} className="aspect-square w-full" />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
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
