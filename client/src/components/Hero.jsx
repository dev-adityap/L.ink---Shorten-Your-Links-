import { useState } from 'react';
import { shortenUrl } from '../api';

export default function Hero({ onShortened }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await shortenUrl(url);
      if (data.data) {
        onShortened(data.data);
        setUrl('');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center animate fade-in">
      <p className="font-sans text-xs font-semibold text-gray-900 tracking-widest uppercase mb-6">
        Simplify your links
      </p>

      <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
        Transform Long Urls, into Tiny Links Instantly!
      </h1>

      <p className="font-sans text-gray-500 text-sm max-w-xl mx-auto mb-10 leading-relaxed">
        Shorten long links, track performance, and manage all your links in one place.
        You can also share direct links, tracking your Link clicks.
      </p>

      <div className="bg-[#FBF9F4] border border-[#EBE9E0] rounded-xl shadow-sm overflow-hidden inline-block w-full max-w-lg mb-10">
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="flex items-center pl-4 text-gray-400">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.13 15.67c-4.19-3.13-4.19-8.24 0-11.37l2.16-1.62c1.56-1.17 4.13-1.17 5.69 0l2.16 1.62c1.56 1.17 1.56 3.11 0 4.28l-2.16 1.62c-1.56 1.17-4.13 1.17-5.69 0z" />
              <line x1="4" y1="20" x2="20" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
          </div>
          <input
            type="url"
            placeholder="https://example.com/some/long/url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-6 py-4 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0"
            disabled={loading}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-4 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors tracking-tighter uppercase whitespace-nowrap"
          >
            {loading ? 'Generating...' : 'Generate Link - its free'}
          </button>
        </form>
      </div>

      {error && (
        <div className="max-w-lg mx-auto px-4 py-3 rounded-lg bg-gray-900 text-xs text-white font-medium">
          {error}
        </div>
      )}

      <div className="mt-12 flex items-center justify-center gap-2 text-xs text-gray-400 font-sans">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full bg-gradient-to-tr from-stone-200 to-stone-300"
          />
        ))}
        <span className="ml-2">1K+ people already using it</span>
      </div>
    </section>
  );
}
