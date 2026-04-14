import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mb-6 text-6xl">⚠️</div>
          <h1 className="mb-4 text-2xl font-serif text-brand-dark">
            Đã xảy ra lỗi
          </h1>
          <p className="mb-8 max-w-md text-brand-gray leading-relaxed">
            Xin lỗi, đã có lỗi xảy ra khi hiển thị trang này. Vui lòng thử tải lại trang.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-sage-600 px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-sage-700"
            >
              Tải lại trang
            </button>
            <a
              href="/"
              className="border border-sage-300 px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-dark transition-colors hover:border-sage-600 hover:bg-sage-50"
            >
              Về trang chủ
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
