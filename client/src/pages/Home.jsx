import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCodeStyling from 'qr-code-styling';
import { Link2, QrCode, BarChart3, Copy, ExternalLink, X, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';
import Stats from '../components/Stats';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import { useAuth } from '../context/AuthContext';

const avatars = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/75.jpg',
  'https://randomuser.me/api/portraits/women/90.jpg',
];

const bodyShapeOptions = [
  { label: 'Square', value: 'square' },
  { label: 'Dots', value: 'dots' },
  { label: 'Rounded', value: 'rounded' },
  { label: 'Classy', value: 'classy' },
  { label: 'Extra Rounded', value: 'extra-rounded' },
];

const cornerShapeOptions = [
  { label: 'Square', value: 'square' },
  { label: 'Dot', value: 'dot' },
  { label: 'Extra Rounded', value: 'extra-rounded' },
];

const fgPresets = ['#000000', '#111827', '#1f2937', '#0f766e', '#1d4ed8'];
const bgPresets = ['#FFFFFF', '#FDFCF7', '#F8F7F2', '#f1f5f9', '#e2e8f0'];

export default function Home({ shortenedUrls, onShortened }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [dotsType, setDotsType] = useState('square');
  const [cornersSquareType, setCornersSquareType] = useState('square');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedShortId, setSelectedShortId] = useState('');
  const qrRef = useRef(null);
  const qrCodeRef = useRef(null);

  useEffect(() => {
    if (location.state?.scrollTo === 'features' || location.hash === '#features') {
      const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
      };
      requestAnimationFrame(scrollToFeatures);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const headers = { 'Content-Type': 'application/json' };
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch {
          // proceed without auth; link will be created anonymously
        }
      }

      const response = await fetch(`${apiBase}/api/shorten`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          originalUrl: url,
          customAlias: customAlias || undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
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
        setExpiresAt('');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const openQR = (originalUrl, shortId) => {
    setQrValue(originalUrl);
    setSelectedShortId(shortId || '');
    setFgColor('#000000');
    setBgColor('#FFFFFF');
    setDotsType('square');
    setCornersSquareType('square');
    setIsCustomizing(false);
    setQrModalOpen(true);
  };

  const getQrOptions = (data) => ({
    width: 200,
    height: 200,
    data: data || ' ',
    dotsOptions: {
      color: fgColor,
      type: dotsType,
    },
    backgroundOptions: {
      color: bgColor,
    },
    cornersSquareOptions: {
      type: cornersSquareType,
      color: fgColor,
    },
    cornersDotOptions: {
      type: cornersSquareType === 'dot' ? 'dot' : 'square',
      color: fgColor,
    },
  });

  useEffect(() => {
    if (!qrModalOpen || !qrValue || !qrRef.current) return;

    qrRef.current.innerHTML = '';
    const qrCode = new QRCodeStyling(getQrOptions(qrValue));
    qrCode.append(qrRef.current);
    qrCodeRef.current = qrCode;

    return () => {
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
      }
      qrCodeRef.current = null;
    };
  }, [qrModalOpen, qrValue]);

  useEffect(() => {
    if (!qrCodeRef.current || !qrValue) return;
    qrCodeRef.current.update(getQrOptions(qrValue));
  }, [fgColor, bgColor, dotsType, cornersSquareType, qrValue]);

  const handleDownloadQR = (extension = 'png') => {
    if (!qrCodeRef.current) return;
    qrCodeRef.current.download({
      name: `qr-${selectedShortId || 'code'}`,
      extension,
    });
  };

  const openAnalytics = async (shortId) => {
    setSelectedShortId(shortId);
    setAnalyticsModalOpen(true);
    setAnalyticsData(null);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const headers = {};
      if (currentUser) {
        try {
          headers.Authorization = `Bearer ${await currentUser.getIdToken()}`;
        } catch {
          // try without token
        }
      }
      const res = await fetch(`${apiBase}/api/analytics/${shortId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data.data);
      } else {
        toast.error('Unable to load analytics');
      }
    } catch {
      toast.error('Unable to load analytics');
    }
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
            <div className="px-4 py-3 border-t border-[#EBE9E0] bg-[#FBF9F4]/50 space-y-2">
              <input
                type="text"
                placeholder="Custom Alias (Optional)"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-transparent border border-[#EBE9E0] rounded-lg focus:outline-none focus:border-gray-900"
                disabled={loading}
              />
              <div>
                <label htmlFor="home-expires-at" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Expiration Date (Optional)
                </label>
                <input
                  id="home-expires-at"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-transparent border border-[#EBE9E0] rounded-lg focus:outline-none focus:border-gray-900"
                  disabled={loading}
                />
              </div>
            </div>
          </form>
        </div>

        {error && (
          <div className="max-w-lg mx-auto px-4 py-3 rounded-lg bg-[#fef2f2] border border-[#fca5a5] text-xs text-[#dc2626] font-medium">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4 font-sans">
          <div className="flex items-center -space-x-3">
            {avatars.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`User ${index + 1}`}
                loading="lazy"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-[#FDFCF7] dark:ring-slate-900 transition-transform duration-200 hover:scale-110 hover:z-10"
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-slate-400">
            1K+ people already using it
          </span>
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
                        <button
                          onClick={() => handleCopy(shortUrl)}
                          className="p-1 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors"
                          aria-label="Copy short link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openQR(url.originalUrl, url.shortId)}
                          className="p-1 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors"
                          aria-label="Show QR code"
                          title="Show QR code"
                        >
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
          <div className="relative bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl max-w-sm w-full mx-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-slate-50 mb-4 text-center">QR Code</h3>
            <div className="bg-[#FDFCF7] dark:bg-slate-900/50 p-4 rounded-xl border border-[#EBE9E0] dark:border-slate-700 mb-3 flex justify-center">
              <div ref={qrRef} />
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 text-center mb-4">
              Points to:{' '}
              <span className="block mt-1 truncate" title={qrValue}>
                {qrValue}
              </span>
            </p>
            <button
              onClick={() => handleDownloadQR('png')}
              className="w-full px-4 py-2.5 text-xs font-bold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors"
            >
              Download
            </button>
            <button
              onClick={() => setIsCustomizing((prev) => !prev)}
              className="mt-3 w-full px-4 py-2.5 text-xs font-bold text-gray-900 dark:text-slate-50 bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-lg hover:bg-[#EFEBE2] dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Sliders className="w-4 h-4" />
              {isCustomizing ? 'Hide Customization' : 'Customize QR'}
            </button>

            {isCustomizing && (
              <div className="mt-4 pt-4 border-t border-[#EBE9E0] dark:border-slate-700 space-y-4 transition-all duration-300">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-2">
                    Foreground Color
                  </p>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-9 w-12 rounded border border-[#EBE9E0] dark:border-slate-700 bg-transparent cursor-pointer"
                      aria-label="Foreground color"
                    />
                    <span className="text-xs text-gray-600 dark:text-slate-400 font-mono">{fgColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fgPresets.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFgColor(color)}
                        className={`w-7 h-7 rounded-md border ${fgColor === color ? 'border-gray-900 dark:border-slate-50 ring-1 ring-gray-900 dark:ring-slate-50' : 'border-[#EBE9E0] dark:border-slate-600'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Foreground ${color}`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-2">
                    Background Color
                  </p>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-9 w-12 rounded border border-[#EBE9E0] dark:border-slate-700 bg-transparent cursor-pointer"
                      aria-label="Background color"
                    />
                    <span className="text-xs text-gray-600 dark:text-slate-400 font-mono">{bgColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bgPresets.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBgColor(color)}
                        className={`w-7 h-7 rounded-md border ${bgColor === color ? 'border-gray-900 dark:border-slate-50 ring-1 ring-gray-900 dark:ring-slate-50' : 'border-[#EBE9E0] dark:border-slate-600'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Background ${color}`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-2">
                    Body Shape
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {bodyShapeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDotsType(option.value)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${dotsType === option.value ? 'bg-gray-900 text-white border-gray-900 dark:bg-slate-50 dark:text-gray-900 dark:border-slate-50' : 'bg-[#FDFCF7] dark:bg-slate-900/50 text-gray-700 dark:text-slate-300 border-[#EBE9E0] dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-2">
                    Corner Eye Shape
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cornerShapeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setCornersSquareType(option.value)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${cornersSquareType === option.value ? 'bg-gray-900 text-white border-gray-900 dark:bg-slate-50 dark:text-gray-900 dark:border-slate-50' : 'bg-[#FDFCF7] dark:bg-slate-900/50 text-gray-700 dark:text-slate-300 border-[#EBE9E0] dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleDownloadQR('png')}
                    className="px-3 py-2 text-xs font-bold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={() => handleDownloadQR('svg')}
                    className="px-3 py-2 text-xs font-bold text-gray-900 dark:text-slate-50 bg-[#FDFCF7] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-lg hover:bg-[#EFEBE2] dark:hover:bg-slate-700 transition-colors"
                  >
                    Download SVG
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {analyticsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setAnalyticsModalOpen(false)} />
          <div className="relative bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-2xl p-8 shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <button onClick={() => setAnalyticsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-slate-50 mb-4">Link Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">Total clicks: <span className="font-semibold text-gray-900 dark:text-slate-50">{analyticsData?.clicks || 0}</span></p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analyticsData?.analytics?.length > 0 ? (
                analyticsData.analytics.slice().reverse().map((a, i) => (
                  <div key={i} className="px-3 py-2 bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-lg">
                    <p className="text-xs text-gray-900 dark:text-slate-50">{new Date(a.clickedAt || a.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{a.referrer || 'Direct / None'} • {a.device || 'Desktop'}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400">No analytics data yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
