import { Search, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SiteSearch({ query = '', onQueryChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    onQueryChange?.(e.target.value);
  };

  const handleClear = () => {
    onQueryChange?.('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard', { state: { linkSearch: trimmed } });
      }
    }
  };

  return (
    <div className="relative w-full max-w-[11rem] sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
      <input
        type="search"
        placeholder="Search links..."
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-50 placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 transition-shadow min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50"
        aria-label="Search links"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50"
          aria-label="Clear search"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
