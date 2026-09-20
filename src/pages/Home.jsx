import useReveal from '../hooks/useReveal';
import {
  AboutBlock,
  BrandStrip,
  CollectionsCarousel,
  HeritageIntro,
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
      <HeritageIntro />
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
