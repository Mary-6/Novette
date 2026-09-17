import { Outlet } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/ui/ScrollToTop';
import { useCart } from '../context/CartContext';

export default function Layout() {
  const { toast } = useCart();
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 bg-ink px-5 py-3 text-sm text-ivory shadow-2xl">
          <CheckCircle2 size={16} className="text-gold" />
          {toast}
        </div>
      )}
    </div>
  );
}
