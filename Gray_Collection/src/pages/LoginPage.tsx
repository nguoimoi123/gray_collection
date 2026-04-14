import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'register';
type GoogleCredentialResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          renderButton: (
            element: HTMLElement,
            options: { theme?: string; size?: string; shape?: string; text?: string; width?: string | number }
          ) => void;
        };
      };
    };
  }
}

const initialRegisterForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirm_password: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postal_code: '',
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, register } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<Mode>('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return;

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return;

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: GoogleCredentialResponse) => {
          if (!response.credential) {
            setError('Không nhận được dữ liệu đăng nhập Google.');
            return;
          }

          try {
            await loginWithGoogle(response.credential);
            navigate('/profile');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Đăng nhập Google thất bại.');
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        width: 320,
      });
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const existingScript = document.querySelector('script[data-google-login="true"]') as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButton, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleLogin = 'true';
    script.onload = renderGoogleButton;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [loginWithGoogle, navigate]);

  const validateLogin = () => {
    if (!loginForm.email.trim() || !loginForm.password) return 'Vui lòng nhập đầy đủ email và mật khẩu.';
    return '';
  };

  const validateRegister = () => {
    if (!registerForm.first_name.trim() || !registerForm.email.trim() || !registerForm.password) return 'Vui lòng điền các trường bắt buộc: tên, email và mật khẩu.';
    if (registerForm.password.length < 6) return 'Mật khẩu cần ít nhất 6 ký tự.';
    if (registerForm.password !== registerForm.confirm_password) return 'Mật khẩu xác nhận không khớp.';
    if (!registerForm.phone.trim()) return 'Vui lòng bổ sung số điện thoại để shop liên hệ.';
    return '';
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateLogin();
    if (validationError) return setError(validationError);
    setError('');
    setIsSubmitting(true);

    try {
      await login(loginForm.email.trim(), loginForm.password);
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateRegister();
    if (validationError) return setError(validationError);
    setError('');
    setIsSubmitting(true);

    try {
      await register({
        first_name: registerForm.first_name.trim(),
        last_name: registerForm.last_name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
        phone: registerForm.phone.trim(),
        address: registerForm.address.trim(),
        city: registerForm.city.trim(),
        province: registerForm.province.trim(),
        postal_code: registerForm.postal_code.trim(),
      });
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sage-50/30 px-6 py-24">
      <div className="w-full max-w-xl border border-sage-100 border-t-4 border-t-mint-300 bg-white p-10 shadow-sm">
        <div className="mb-8 flex gap-3">
          <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] ${mode === 'login' ? 'bg-sage-600 text-white' : 'bg-sage-50 text-brand-gray'}`}>
            Đăng nhập
          </button>
          <button type="button" onClick={() => { setMode('register'); setError(''); }} className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] ${mode === 'register' ? 'bg-sage-600 text-white' : 'bg-sage-50 text-brand-gray'}`}>
            Đăng ký
          </button>
        </div>

        <h1 className="mb-2 text-center text-3xl font-serif">{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</h1>
        <p className="mb-8 text-center text-sm text-brand-gray">
          {mode === 'login' ? 'Đăng nhập để theo dõi đơn hàng và lưu lại mùi hương bạn yêu thích.' : 'Tạo tài khoản để đặt hàng nhanh hơn và xem lịch sử mua sắm.'}
        </p>

        {error && <p className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>}

        {mode === 'login' ? (
          <>
            <form className="space-y-6" onSubmit={handleLogin}>
              <input type="email" value={loginForm.email} onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))} className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" placeholder="Email" />
              <input type="password" value={loginForm.password} onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))} className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" placeholder="Mật khẩu" />
              <button type="submit" disabled={isSubmitting} className="block w-full bg-sage-600 py-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-sage-700 disabled:opacity-70">
                {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs uppercase tracking-[0.25em] text-brand-gray">Hoặc</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="flex justify-center">
              <div ref={googleButtonRef} />
            </div>
          </>
        ) : (
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={registerForm.first_name} onChange={(event) => setRegisterForm((prev) => ({ ...prev, first_name: event.target.value }))} className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" placeholder="Họ" />
              <input type="text" value={registerForm.last_name} onChange={(event) => setRegisterForm((prev) => ({ ...prev, last_name: event.target.value }))} className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" placeholder="Tên" />
            </div>
            <input type="email" value={registerForm.email} onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))} className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" placeholder="Email" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input type="password" value={registerForm.password} onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))} className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" placeholder="Mật khẩu" />
              <input type="password" value={registerForm.confirm_password} onChange={(event) => setRegisterForm((prev) => ({ ...prev, confirm_password: event.target.value }))} className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" placeholder="Nhập lại mật khẩu" />
            </div>
            <input type="text" value={registerForm.phone} onChange={(event) => setRegisterForm((prev) => ({ ...prev, phone: event.target.value }))} className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" placeholder="Số điện thoại" />
            <input type="text" value={registerForm.address} onChange={(event) => setRegisterForm((prev) => ({ ...prev, address: event.target.value }))} className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" placeholder="Địa chỉ" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <input type="text" value={registerForm.city} onChange={(event) => setRegisterForm((prev) => ({ ...prev, city: event.target.value }))} className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" placeholder="Thành phố" />
              <input type="text" value={registerForm.province} onChange={(event) => setRegisterForm((prev) => ({ ...prev, province: event.target.value }))} className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" placeholder="Tỉnh" />
              <input type="text" value={registerForm.postal_code} onChange={(event) => setRegisterForm((prev) => ({ ...prev, postal_code: event.target.value }))} className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" placeholder="Mã bưu chính" />
            </div>
            <button type="submit" disabled={isSubmitting} className="block w-full bg-sage-600 py-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-sage-700 disabled:opacity-70">
              {isSubmitting ? 'Đang xử lý...' : 'Tạo tài khoản'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-brand-gray">
          <Link to="/collection" className="font-medium text-sage-600 hover:text-sage-800">
            Quay lại mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
