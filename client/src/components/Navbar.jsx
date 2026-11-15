import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import MobileMenu from './MobileMenu';
import SiteSearch from './SiteSearch';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { currentUser, logout } = useAuth();

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

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#FDFCF7]/90 dark:bg-slate-900/90 backdrop-blur border-b border-[#EBE9E0] dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <span className="font-serif font-bold text-xl text-gray-900 dark:text-slate-50 tracking-tight">L.</span>
              <span className="font-sans font-bold text-xs text-gray-900 dark:text-slate-200 tracking-widest uppercase">ink</span>
              <span className="text-xs text-gray-500 dark:text-slate-400">™</span>
            </Link>

            <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-slate-400">
              <Link to="/" className="nav-link">Home</Link>
              <a href="#features" className="nav-link">Features</a>
              {currentUser ? (
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              ) : (
                <Link to="/login" className="nav-link">Login</Link>
              )}
              <Link to="/contact" className="nav-link">Contact us</Link>
            </div>

            <div className="flex items-center gap-4">
              <SiteSearch />
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-50 transition-colors rounded-lg hover:bg-[#EFEBE2] dark:hover:bg-slate-800"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 rounded hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors tracking-tighter uppercase"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden sm:inline px-5 py-2.5 text-xs font-bold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 rounded hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors tracking-tighter uppercase"
                  >
                    Signup - its free
                  </Link>
                </>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-50 focus:outline-none"
                aria-label="Open menu"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={mobileOpen} onToggle={() => setMobileOpen(!mobileOpen)} />
    </>
  );
}

