import { useState } from 'react';
import WatchArt from './WatchArt';
import { brandBySlug } from '../../data/utils';

export default function WatchImage({ watch, index = 0, className = '', view, alt, eager = false }) {
  const [failed, setFailed] = useState(false);
  const src = watch?.images?.[index];
  const brand = brandBySlug(watch?.brandSlug);
  const name = `${brand?.name || ''} ${watch?.model || ''}, ${watch?.reference || ''}`
    .replace(/, $/, '')
    .trim();
  if (!src || failed) {
    return (
      <WatchArt
        art={watch.art}
        view={view}
        className={className}
        label={alt || `Illustrated representation of ${name}`}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt || (view ? `${name}, ${view}` : name)}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      fetchpriority={eager ? 'high' : undefined}
      onError={() => setFailed(true)}
      className={`${className} object-cover`}
    />
  );
}
