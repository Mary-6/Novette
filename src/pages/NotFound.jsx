import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <section className="py-32 text-center">
      <p className="eyebrow mb-4">404, Not Found</p>
      <h1 className="heading-display text-5xl font-medium">Lost in time.</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-graphite">
        The page you are looking for is not in our collection, but eighty fine timepieces are.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button to="/shop">Browse the collection</Button>
        <Link
          to="/brands"
          className="text-xs uppercase tracking-[0.2em] text-goldDark underline underline-offset-4 transition hover:text-gold"
        >
          Shop by brand
        </Link>
      </div>
    </section>
  );
}
