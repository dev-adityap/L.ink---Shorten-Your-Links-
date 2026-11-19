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
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
      <input
        type="search"
        placeholder="Search site..."
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="search-input pl-10 pr-8"
        aria-label="Search links"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          aria-label="Clear search"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
