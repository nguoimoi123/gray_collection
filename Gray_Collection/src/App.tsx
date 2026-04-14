import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FloatingContactButtons } from './components/FloatingContactButtons';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AboutPage } from './pages/AboutPage';
import { ArchivePage } from './pages/ArchivePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CollectionPage } from './pages/CollectionPage';
import { GiftSetPage } from './pages/GiftSetPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MomoReturnPage } from './pages/MomoReturnPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { PaymentPolicyPage } from './pages/PaymentPolicyPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { ProductPage } from './pages/ProductPage';
import { ProfilePage } from './pages/ProfilePage';
import { VnpayReturnPage } from './pages/VnpayReturnPage';
import { WarrantyPolicyPage } from './pages/WarrantyPolicyPage';
import { WishlistPage } from './pages/WishlistPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isCheckout = location.pathname === '/checkout';

  return (
    <div className="flex min-h-screen flex-col">
      {!isCheckout && <Header />}
      <main className="flex-grow">{children}</main>
      {!isCheckout && <Footer />}
      <FloatingContactButtons />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/collection" element={<CollectionPage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/gift-set" element={<GiftSetPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/archive" element={<ArchivePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />
                  <Route path="/momo-return" element={<MomoReturnPage />} />
                  <Route path="/vnpay-return" element={<VnpayReturnPage />} />
                  <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicyPage />} />
                  <Route path="/chinh-sach-thanh-toan" element={<PaymentPolicyPage />} />
                  <Route path="/chinh-sach-bao-hanh-doi-tra" element={<WarrantyPolicyPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
            </Router>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
