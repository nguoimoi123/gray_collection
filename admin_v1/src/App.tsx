import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LockKeyhole, LogOut } from 'lucide-react';
import { TopNav } from './components/TopNav';
import { ChatPage } from './components/ChatPage';
import { ProductsPage } from './components/ProductsPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { OrdersPage } from './components/OrdersPage';
import { OrderDetailPage } from './components/OrderDetailPage';
import { UsersPage } from './components/UsersPage';
import { UserDetailPage } from './components/UserDetailPage';
import { ContactPage } from './components/ContactPage';
import { ReviewsPage } from './components/ReviewsPage';
import { GiftSetsPage } from './components/GiftSetsPage';
import { BrandsPage } from './components/BrandsPage';

const ADMIN_ACCESS_STORAGE_KEY = 'admin-access-granted';

function AdminAccessGate({
  isDark,
  onUnlock,
}: {
  isDark: boolean;
  onUnlock: () => void;
}) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const expectedKey = import.meta.env.VITE_ADMIN_SECRET_KEY?.trim() || '';

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!expectedKey) {
      onUnlock();
      return;
    }

    if (input.trim() === expectedKey) {
      localStorage.setItem(ADMIN_ACCESS_STORAGE_KEY, 'true');
      onUnlock();
      return;
    }

    setError('Secret key không đúng.');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="mb-6 flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? 'bg-cyan-500/10 text-cyan-300' : 'bg-blue-50 text-blue-600'}`}>
            <LockKeyhole size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Admin Access</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Nhập secret key để vào dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`mb-2 block text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Secret key
            </label>
            <input
              type="password"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                if (error) setError('');
              }}
              className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${isDark ? 'border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:border-cyan-500' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500'}`}
              placeholder="Nhập key từ file .env"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            className={`w-full rounded-2xl px-4 py-3 font-medium transition ${isDark ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            Vào admin
          </button>
        </form>
      </div>
    </div>
  );
}

export function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('admin-theme');
    return saved ? saved === 'dark' : true;
  });

  const hasConfiguredSecret = useMemo(
    () => Boolean(import.meta.env.VITE_ADMIN_SECRET_KEY?.trim()),
    []
  );

  const [hasAccess, setHasAccess] = useState<boolean>(() => {
    if (!import.meta.env.VITE_ADMIN_SECRET_KEY?.trim()) return true;
    return localStorage.getItem(ADMIN_ACCESS_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(isDark ? 'dark-theme' : 'light-theme');
    localStorage.setItem('admin-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_ACCESS_STORAGE_KEY);
    setHasAccess(false);
  };

  if (!hasAccess) {
    return <AdminAccessGate isDark={isDark} onUnlock={() => setHasAccess(true)} />;
  }

  return (
    <Router>
      <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
        <TopNav isDark={isDark} onToggleTheme={() => setIsDark(prev => !prev)} />
        {hasConfiguredSecret && (
          <div className={`border-b px-6 py-2 ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'}`}>
            <div className="mx-auto flex max-w-7xl items-center justify-end">
              <button
                type="button"
                onClick={handleLogout}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
              >
                <LogOut size={16} />
                Đăng xuất admin
              </button>
            </div>
          </div>
        )}
        <Routes>
          <Route path="/" element={<ChatPage isDark={isDark} />} />
          <Route path="/chat" element={<ChatPage isDark={isDark} />} />
          <Route path="/contact" element={<ContactPage isDark={isDark} />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/gift-sets" element={<GiftSetsPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}
