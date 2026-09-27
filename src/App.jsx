import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import { BrandsIndex, BrandPage, RolexFamilyPage, RolexHub } from './pages/Brands';
import { CollectionsIndex, CollectionPage } from './pages/Collections';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import Contact from './pages/Contact';
import InfoPage from './pages/Info';
import { JournalIndex, JournalArticle } from './pages/Journal';
import { Login, Signup } from './pages/Account';
import { VerifyEmail, ResetPassword, ForgotPassword } from './pages/AuthPages';
import Admin from './pages/Admin';
import Wishlist from './pages/Wishlist';
import ImageCredits from './pages/ImageCredits';
import NotFound from './pages/NotFound';
import RouteSeo from './components/seo/RouteSeo';

const INFO_SLUGS = [
  'about-us',
  'why-buy-from-us',
  'authenticity-pledge',
  'buyers-protection-plan',
  'shipping-info',
  'international-shipping',
  'return-policy',
  'warranty',
  'faqs',
  'locations',
  'trust-and-compliance',
  'privacy-policy',
  'terms-and-conditions',
  'buying-guide',
  'watch-care',
  'sitemap',
  'accessibility',
];

// /image-credits is a dedicated page (not data-driven).

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/new-arrivals" element={<Navigate to="/shop?sort=newest" replace />} />
        <Route path="/watches/:slug" element={<ProductDetail />} />
        <Route path="/brands" element={<BrandsIndex />} />
        <Route path="/brands/:slug" element={<BrandPage />} />
        <Route path="/rolex" element={<RolexHub />} />
        <Route path="/rolex/:family" element={<RolexFamilyPage />} />
        <Route path="/collections" element={<CollectionsIndex />} />
        <Route path="/collections/:slug" element={<CollectionPage />} />
        <Route path="/journal" element={<JournalIndex />} />
        <Route path="/journal/:slug" element={<JournalArticle />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/confirmation" element={<Confirmation />} />
        <Route path="/about" element={<Navigate to="/about-us" replace />} />
        <Route path="/contact" element={<Navigate to="/contact-us" replace />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/image-credits" element={<ImageCredits />} />
        {INFO_SLUGS.map((slug) => (
          <Route key={slug} path={`/${slug}`} element={<InfoPage slug={slug} />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
