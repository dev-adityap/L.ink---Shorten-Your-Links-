import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (location.state?.message) {
      toast(location.state.message, { icon: '🔒' });
      navigate(location.pathname, { replace: true, state: { ...location.state, message: undefined } });
    }
  }, [location, navigate]);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-slate-900 flex items-center justify-center px-4 py-16 sm:py-20 overflow-x-hidden">
      <div className="w-full max-w-md min-w-0">
        <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="font-serif font-bold text-2xl text-gray-900 dark:text-slate-50 tracking-tight">L.</span>
              <span className="font-sans font-bold text-sm text-gray-900 dark:text-slate-200 tracking-widest uppercase">ink</span>
              <span className="text-xs text-gray-500 dark:text-slate-400">™</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-slate-50 mb-2">
              Welcome Back
            </h1>
            <p className="font-sans text-sm text-gray-600 dark:text-slate-400">
              Sign in to access your account
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#fef2f2] dark:bg-red-900/20 border border-[#fca5a5] dark:border-red-800 rounded-lg text-sm text-[#dc2626] dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-3 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 min-h-[44px] text-sm text-gray-900 dark:text-slate-100 bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-600 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-50 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 min-h-[44px] text-sm text-gray-900 dark:text-slate-100 bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-600 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-50 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 min-h-[48px] text-xs font-bold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors tracking-tighter uppercase disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="border-t border-[#EBE9E0] dark:border-slate-700 pt-6 mb-6">
            <p className="text-xs text-center text-gray-600 dark:text-slate-400 mb-4">Or continue with</p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 min-h-[48px] bg-[#FBF9F4] dark:bg-slate-700 border border-[#EBE9E0] dark:border-slate-600 text-gray-900 dark:text-slate-50 rounded-xl hover:bg-[#EFEBE2] dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-gray-900 dark:text-slate-50 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
