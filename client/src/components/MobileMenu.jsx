import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MobileMenu({ isOpen, onToggle, onNavigateFeatures }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') onToggle(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onToggle]);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Features', action: 'features' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Contact us', to: '/contact' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/95 dark:bg-slate-950/95 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="absolute top-0 right-0 p-4">
            <button onClick={onToggle} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-400 hover:text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Close menu">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-full text-center px-6" onClick={(e) => e.stopPropagation()}>
            {navLinks.map((link) => {
              if (link.action === 'features') {
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={(e) => {
                      onToggle();
                      onNavigateFeatures?.(e);
                    }}
                    className="block w-full max-w-xs px-4 py-4 min-h-[44px] text-xl font-serif font-bold text-white hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                  </button>
                );
              }

              return (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={onToggle}
                  className="block w-full max-w-xs px-4 py-4 min-h-[44px] text-xl font-serif font-bold text-white hover:text-gray-300 transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-xs">
              <Link to="/login" onClick={onToggle} className="min-h-[44px] inline-flex items-center justify-center text-sm font-medium text-gray-300 hover:text-white w-full sm:w-auto">
                Login
              </Link>
              <Link to="/signup" onClick={onToggle} className="btn-cream w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center">Signup - its free</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

