import { useState } from 'react';
import { shortenUrl } from '../api';

export default function UrlForm({ onShortened }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await shortenUrl(originalUrl);
      if (data.data) {
        onShortened(data.data);
        setOriginalUrl('');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <input
          type="url"
          placeholder="Paste a long URL (e.g. https://example.com/some/long/path)"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="input-field pr-16"
          disabled={loading}
          autoComplete="off"
          spellCheck="false"
        />
        <button
          type="submit"
          disabled={loading || !originalUrl.trim()}
          className="btn-primary absolute right-1 top-1"
        >
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </div>
      {error && (
        <div className="rounded-lg bg-[#fef2f2] border border-[#fca5a5] px-4 py-3 text-sm text-[#dc2626]">
          {error}
        </div>
      )}
    </form>
  );
}
