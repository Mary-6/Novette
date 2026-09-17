import useReveal from '../hooks/useReveal';
import {
  CollectionsShowcase,
  FeaturedBrands,
  FeaturedWatches,
  Hero,
  NewArrivals,
  Newsletter,
  PopularWatches,
  Reviews,
  TrustSection,
} from '../components/home/sections';

export default function Home() {
  useReveal([]);
  return (
    <>
      <Hero />
      <FeaturedWatches />
      <NewArrivals />
      <FeaturedBrands />
      <PopularWatches />
      <CollectionsShowcase />
      <TrustSection />
      <Reviews />
      <Newsletter />
    </>
  );
}
