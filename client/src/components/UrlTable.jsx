import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UrlTable({ urls }) {
  const [copiedId, setCopiedId] = useState(null);

  if (!urls || urls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500 text-sm">No shortened URLs yet.</p>
      </div>
    );
  }

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Link copied!');
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    } catch {
      toast.error('Failed to copy. Please copy manually.');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#EBE9E0]">
            <th className="glass-card px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
              Original URL
            </th>
            <th className="glass-card px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
              Short Link
            </th>
            <th className="glass-card px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Clicks
            </th>
            <th className="glass-card px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url) => {
            const shortUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${url.shortId}`;
            const id = url._id || url.shortId;
            return (
              <tr key={id} className="link-row animate fade-in">
                <td className="px-4 py-3">
                  {url.title && <span className="block text-sm font-semibold text-gray-900 truncate max-w-xs" title={url.title}>{url.title}</span>}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 truncate max-w-xs" title={url.originalUrl}>
                      {url.originalUrl}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center text-sm font-mono text-gray-900 truncate max-w-xs">
                      {shortUrl}
                    </span>
                    <button
                      className="copy-btn"
                      title={copiedId === id ? 'Copied!' : 'Copy short link'}
                      aria-label={copiedId === id ? 'Copied short link' : 'Copy short link'}
                      onClick={() => handleCopy(shortUrl, id)}
                    >
                      {copiedId === id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs font-medium text-gray-600 hover:text-gray-900 underline underline-offset-4 transition-colors"
                    >
                      Open
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-gray-900">
                      {Number(url.clicks) || 0}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {url.createdAt ? new Date(url.createdAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
