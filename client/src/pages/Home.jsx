import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link2, QrCode, BarChart3, Copy, ExternalLink, X } from 'lucide-react';
import Stats from '../components/Stats';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';

export default function Home({ shortenedUrls, onShortened }) {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedShortId, setSelectedShortId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: url, customAlias: customAlias || undefined }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to shorten URL');
      }

      const data = await response.json();
      if (data.data) {
        onShortened(data.data);
        setUrl('');
        setCustomAlias('');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openQR = (shortUrl) => {
    setQrUrl(shortUrl);
    setQrModalOpen(true);
  };

  const openAnalytics = async (shortId) => {
    setSelectedShortId(shortId);
    setAnalyticsModalOpen(true);
    setAnalyticsData(null);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/analytics/${shortId}`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data.data);
      }
    } catch {
      // ignore
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-${selectedShortId || 'link'}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center animate fade-in">
        <p className="font-sans text-xs font-semibold text-gray-900 tracking-widest uppercase mb-6">
          Simplify your links
        </p>

      <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-[#FDFCF7] leading-tight mb-8">
        Transform Long Urls, into Tiny Links Instantly!
      </h1>

      <p className="font-sans text-gray-500 dark:text-slate-300 text-sm max-w-xl mx-auto mb-10 leading-relaxed">
          Shorten long links, track performance, and manage all your links in one place.
        </p>

        <div className="bg-[#F8F7F2] border border-[#EBE9E0] rounded-xl shadow-sm overflow-hidden inline-block w-full max-w-lg mb-4">
          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="flex items-center">
              <div className="flex items-center pl-4 text-gray-400">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                type="url"
                placeholder="https://example.com/some/long/url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-4 py-4 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0"
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
            </div>
            <div className="px-4 py-3 border-t border-[#EBE9E0] bg-[#FBF9F4]/50">
              <input
                type="text"
                placeholder="Custom Alias (Optional)"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-transparent border border-[#EBE9E0] rounded-lg focus:outline-none focus:border-gray-900"
                disabled={loading}
              />
            </div>
          </form>
        </div>

        {error && (
          <div className="max-w-lg mx-auto px-4 py-3 rounded-lg bg-[#fef2f2] border border-[#fca5a5] text-xs text-[#dc2626] font-medium">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 font-sans">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-tr from-stone-200 to-stone-300" />
          ))}
          <span className="ml-2">1K+ people already using it</span>
        </div>
      </section>

      {shortenedUrls.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="bg-[#F8F7F2] border border-[#EBE9E0] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#EBE9E0]">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Original URL</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Short Link</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {shortenedUrls.map((url) => {
                  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                  const shortUrl = `${apiBase}/${url.shortId}`;
                  return (
                    <tr key={url.shortId} className="border-b border-[#EBE9E0] hover:bg-[#FBF9F4]">
                      <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">{url.originalUrl}</td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-900">{shortUrl}</span>
                        <button onClick={() => { navigator.clipboard.writeText(shortUrl); }} className="p-1 text-gray-500 hover:text-gray-900">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => openQR(shortUrl)} className="p-1 text-gray-500 hover:text-gray-900">
                          <QrCode className="w-4 h-4" />
                        </button>
                        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-500 hover:text-gray-900">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openAnalytics(url.shortId)} className="flex items-center gap-2 ml-auto text-sm text-gray-900 hover:text-gray-600">
                          <BarChart3 className="w-4 h-4" />
                          {url.clicks || 0}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Stats />
      <Features />
      <Testimonials />
      <FAQ />

      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setQrModalOpen(false)} />
          <div className="relative bg-[#F8F7F2] border border-[#EBE9E0] rounded-2xl p-8 shadow-xl max-w-sm w-full mx-4">
            <button onClick={() => setQrModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 text-center">QR Code</h3>
            <div className="bg-[#FDFCF7] p-4 rounded-xl border border-[#EBE9E0] mb-4 flex justify-center">
              <QRCodeSVG id="qr-svg" value={qrUrl} size={200} />
            </div>
            <button onClick={downloadQR} className="w-full px-4 py-2 text-xs font-bold text-white bg-gray-900 rounded hover:bg-gray-800">
              Download
            </button>
          </div>
        </div>
      )}

      {analyticsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setAnalyticsModalOpen(false)} />
          <div className="relative bg-[#F8F7F2] border border-[#EBE9E0] rounded-2xl p-8 shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <button onClick={() => setAnalyticsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-4">Link Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">Total clicks: <span className="font-semibold text-gray-900">{analyticsData?.clicks || 0}</span></p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analyticsData?.analytics?.length > 0 ? (
                analyticsData.analytics.slice().reverse().map((a, i) => (
                  <div key={i} className="px-3 py-2 bg-[#FBF9F4] border border-[#EBE9E0] rounded-lg">
                    <p className="text-xs text-gray-900">{new Date(a.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 truncate">{a.userAgent}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No analytics data yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
