import WatchCard from './WatchCard';

export default function WatchGrid({ watches, className = '' }) {
  return (
    <div className={`grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {watches.map((w) => (
        <WatchCard key={w.id} watch={w} />
      ))}
    </div>
  );
}
