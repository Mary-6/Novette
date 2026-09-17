import useReveal from '../hooks/useReveal';
import {
  AboutBlock,
  BrandStrip,
  CollectionsCarousel,
  Hero,
  JournalPreview,
  MarketIndex,
  NewArrivals,
  Newsletter,
  PopularSearches,
  PromiseSection,
  Reviews,
  RolexFamiliesSection,
  WhyShop,
} from '../components/home/sections';

export default function Home() {
  useReveal([]);
  return (
    <>
      <Hero />
      <BrandStrip />
      <RolexFamiliesSection />
      <NewArrivals />
      <CollectionsCarousel />
      <MarketIndex />
      <JournalPreview />
      <PromiseSection />
      <AboutBlock />
      <Reviews />
      <WhyShop />
      <PopularSearches />
      <Newsletter />
    </>
  );
}
