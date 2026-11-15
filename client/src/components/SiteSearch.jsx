import { useState } from 'react';

export default function SiteSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const pages = [
    { title: 'Home', path: '#', description: 'Landing page with URL shortener' },
    { title: 'Features', path: '#features', description: 'Advanced Link Analytics, Customizable Links, Generate QRs' },
    { title: 'About', path: '#about', description: 'About L.ink URL shortener' },
    { title: 'Contact us', path: '#contact', description: 'Get in touch with our team' },
    { title: 'FAQ', path: '#faq', description: 'Frequently asked questions' },
  ];

  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setQuery(q);
    if (q.length > 0) {
      setResults(
        pages.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        )
      );
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleSelect = (path) => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    window.location.hash = path;
  };

  return (
    <div className="relative">
      <input
        type="search"
        placeholder="Search site..."
        value={query}
        onChange={handleSearch}
        className="search-input pl-10 pr-8"
        aria-label="Site search"
      />
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#FBF9F4] border border-[#EBE9E0] rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
          {results.map((page) => (
            <button
              key={page.title}
              onClick={() => handleSelect(page.path)}
              className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-[#EFEBE2] transition-colors"
            >
              <div className="font-medium">{page.title}</div>
              <div className="text-xs text-gray-500">{page.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
