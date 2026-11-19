import { Link } from 'react-router-dom';

export default function MobileMenu({ isOpen, onToggle, onNavigateFeatures }) {
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
          className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        >
          <div className="absolute top-0 right-0 p-4">
            <button onClick={onToggle} className="text-gray-400 hover:text-white">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-full text-center">
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
                    className="block px-4 py-4 text-xl font-serif font-bold text-white hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                  </button>
                );
              }

              return link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={onToggle}
                  className="block px-4 py-4 text-xl font-serif font-bold text-white hover:text-gray-300 transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={onToggle}
                  className="block px-4 py-4 text-xl font-serif font-bold text-white hover:text-gray-300 transition-colors"
                >
                  {link.label}
                </a>
              );
            })}
            <div className="mt-8 flex items-center gap-4">
              <Link to="/login" onClick={onToggle} className="text-sm font-medium text-gray-300 hover:text-white">
                Login
              </Link>
              <Link to="/signup" onClick={onToggle} className="btn-cream">Signup - its free</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

