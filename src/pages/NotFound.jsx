import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <section className="py-32 text-center">
      <p className="eyebrow mb-4">404</p>
      <h1 className="heading-display text-5xl font-medium">Lost in time.</h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-graphite">
        The page you are looking for is not in our collection — but sixty fine timepieces are.
      </p>
      <Button to="/shop" className="mt-8">
        Return to the collection
      </Button>
    </section>
  );
}
