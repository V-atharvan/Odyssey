import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f1115] text-white animate-fade-in">
          <div className="text-center max-w-md w-full">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <AlertOctagon className="text-red-500" size={48} />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Something went wrong</h2>
            <p className="text-gray-300 text-lg mb-10 leading-relaxed">
              We encountered an unexpected error. This might be due to a connection issue or a temporary glitch.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-900/20 mx-auto transform hover:-translate-y-1 active:scale-95"
            >
              <RefreshCw size={22} />
              Reload Page
            </button>
            <div className="mt-12 p-6 bg-black/60 rounded-2xl text-left border border-white/10">
              <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-3">Error Details:</p>
              <p className="text-gray-400 text-sm font-mono leading-relaxed break-all bg-black/40 p-3 rounded-lg">
                {this.state.error?.toString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
