  import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import MobileMenu from './MobileMenu';
import SiteSearch from './SiteSearch';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ siteSearchQuery = '', onSiteSearchQueryChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleFeaturesClick = (e) => {
    e.preventDefault();
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: 'features' } });
    } else {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#FDFCF7]/90 dark:bg-slate-900/90 backdrop-blur border-b border-[#EBE9E0] dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center cursor-pointer shrink-0" aria-label="L.ink home">
              <img src="/assets/logo.png" alt="L.ink logo" className="h-12 sm:h-14 lg:h-16 w-auto" />
            </Link>

            <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-gray-600 dark:text-slate-400">
              <Link to="/" className="nav-link">Home</Link>
              <button type="button" onClick={handleFeaturesClick} className="nav-link">Features</button>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/contact" className="nav-link">Contact us</Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="hidden sm:block min-w-0">
                <SiteSearch query={siteSearchQuery} onQueryChange={onSiteSearchQueryChange} />
              </div>
              <button
                onClick={toggleTheme}
                className="p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-50 transition-colors rounded-lg hover:bg-[#EFEBE2] dark:hover:bg-slate-800 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDFCF7] dark:focus-visible:ring-offset-slate-900"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-pressed={isDarkMode}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center justify-center px-4 sm:px-5 py-2.5 min-h-[44px] text-xs font-bold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 rounded hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors tracking-tighter uppercase shrink-0"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden md:inline-flex items-center justify-center px-4 lg:px-5 py-2.5 min-h-[44px] text-xs font-bold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 rounded hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors tracking-tighter uppercase shrink-0"
                  >
                    Signup - its free
                  </Link>
                </>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-50 focus:outline-none rounded-lg hover:bg-[#EFEBE2] dark:hover:bg-slate-800 shrink-0"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={mobileOpen}
        onToggle={() => setMobileOpen(!mobileOpen)}
        onNavigateFeatures={handleFeaturesClick}
      />
    </>
  );
}

