import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import QRCodeStyling from 'qr-code-styling';
import { Link2, QrCode, BarChart3, Copy, Check, ExternalLink, X, Sliders, Lock } from 'lucide-react';
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

const GUEST_LINK_IDS_KEY = 'link_guest_short_ids';

const readGuestLinkIds = () => {
  try {
    const raw = localStorage.getItem(GUEST_LINK_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
};

const saveGuestLinkId = (shortId) => {
  const ids = readGuestLinkIds();
  if (!ids.includes(shortId)) {
    ids.unshift(shortId);
    localStorage.setItem(GUEST_LINK_IDS_KEY, JSON.stringify(ids.slice(0, 50)));
  }
};

export default function Home({ shortenedUrls, onShortened }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxClicks, setMaxClicks] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [showUtm, setShowUtm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [dotsType, setDotsType] = useState('square');
  const [cornersSquareType, setCornersSquareType] = useState('square');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [qrBadgeMode, setQrBadgeMode] = useState('none');
  const [qrBadgeText, setQrBadgeText] = useState('');
  const [qrDownloadFeedback, setQrDownloadFeedback] = useState('');
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedShortId, setSelectedShortId] = useState('');
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const qrRef = useRef(null);
  const qrCodeRef = useRef(null);
  const qrTriggerRef = useRef(null);
  const analyticsTriggerRef = useRef(null);
  const qrCloseRef = useRef(null);
  const analyticsCloseRef = useRef(null);

  function buildTaggedUrl(raw, utm) {
    const trimmed = (raw || '').trim();
    if (!trimmed) return { url: '', error: null };
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { url: trimmed, error: 'UTM tags require a valid http:// or https:// URL' };
      }
      for (const [key, value] of Object.entries(utm)) {
        if (value) parsed.searchParams.set(key, value);
      }
      return { url: parsed.toString(), error: null };
    } catch {
      return { url: trimmed, error: Object.values(utm).some(Boolean) ? 'Enter a valid URL before adding UTM parameters' : null };
    }
  }

  const utmFields = { utm_source: utmSource.trim(), utm_medium: utmMedium.trim(), utm_campaign: utmCampaign.trim() };
  const hasUtm = Object.values(utmFields).some(Boolean);
  const taggedDestination = buildTaggedUrl(url, utmFields);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const destination = buildTaggedUrl(url, utmFields);
    if (hasUtm && destination.error) {
      setError(destination.error);
      return;
    }
    const finalUrl = destination.url || url.trim();
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

      const payload = {
        originalUrl: finalUrl,
        title: title.trim() || undefined,
      };
      if (currentUser) {
        payload.customAlias = customAlias || undefined;
        payload.expiresAt = expiresAt ? new Date(expiresAt).toISOString() : null;
        const parsedMax = maxClicks === '' ? null : Number(maxClicks);
        payload.maxClicks = Number.isInteger(parsedMax) && parsedMax >= 1 ? parsedMax : null;
      }

      const response = await fetch(`${apiBase}/api/shorten`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to shorten URL');
      }

      const data = await response.json();
      if (data.data) {
        onShortened(data.data);
        if (!currentUser && data.data.shortId) {
          saveGuestLinkId(data.data.shortId);
          setShowGuestPrompt(true);
        }
        setUrl('');
        setTitle('');
        setCustomAlias('');
        setExpiresAt('');
        setMaxClicks('');
        setUtmSource('');
        setUtmMedium('');
        setUtmCampaign('');
        setShowUtm(false);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (shortUrl, shortId) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(shortId);
      toast.success('Link copied to clipboard!');
      window.setTimeout(() => setCopiedId((prev) => (prev === shortId ? null : prev)), 2000);
    } catch {
      toast.error('Failed to copy link. Please copy it manually.');
    }
  };

  const openQR = (originalUrl, shortId, triggerEl) => {
    qrTriggerRef.current = triggerEl || document.activeElement;
    setQrValue(originalUrl);
    setSelectedShortId(shortId || '');
    setFgColor('#000000');
    setBgColor('#FFFFFF');
    setDotsType('square');
    setCornersSquareType('square');
    setIsCustomizing(false);
    setQrBadgeMode('none');
    setQrBadgeText('');
    setQrDownloadFeedback('');
    setQrModalOpen(true);
  };

  const closeQR = () => {
    setQrModalOpen(false);
    requestAnimationFrame(() => qrTriggerRef.current?.focus?.());
  };

  const openAnalytics = async (shortId, triggerEl) => {
    analyticsTriggerRef.current = triggerEl || document.activeElement;
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

  const closeAnalytics = () => {
    setAnalyticsModalOpen(false);
    requestAnimationFrame(() => analyticsTriggerRef.current?.focus?.());
  };

  const makeBadgeDataUrl = (mode, text, fg, bg) => {
    const size = 256;
    const pad = 18;
    const inner = size - pad * 2;
    const radius = inner / 2;
    const safeText = (text || '').trim().slice(0, 3).toUpperCase() || 'L';
    const fontSize = safeText.length === 1 ? 112 : safeText.length === 2 ? 88 : 70;
    const brandMark = `
      <g transform="translate(58,66)">
        <rect x="0" y="0" width="140" height="124" rx="30" fill="${fg}"/>
        <path d="M42 32h22v44h34v18H42z" fill="${bg}"/>
        <circle cx="106" cy="86" r="8" fill="#D97757"/>
      </g>`;
    const initials = `
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="800" fill="${fg}" letter-spacing="${safeText.length > 1 ? 1 : 0}">${safeText}</text>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="geometricPrecision">
      <circle cx="${size / 2}" cy="${size / 2}" r="${inner / 2}" fill="${bg}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${inner / 2 - 5}" fill="none" stroke="${fg}" stroke-opacity="0.08" stroke-width="8"/>
      ${mode === 'brand' ? brandMark : initials}
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const qrBadgeImage = qrBadgeMode === 'none'
    ? undefined
    : makeBadgeDataUrl(qrBadgeMode, qrBadgeText, fgColor, bgColor);
  const qrHasBadge = Boolean(qrBadgeImage);

  const getQrOptions = (data, { width = 200, height = 200 } = {}) => ({
    width,
    height,
    data: data || ' ',
    margin: 0,
    qrOptions: {
      errorCorrectionLevel: qrHasBadge ? 'H' : 'M',
    },
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
    image: qrBadgeImage,
    imageOptions: {
      crossOrigin: 'anonymous',
      hideBackgroundDots: true,
      imageSize: 0.35,
      margin: 6,
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
  }, [fgColor, bgColor, dotsType, cornersSquareType, qrValue, qrBadgeMode, qrBadgeText]);

  const handleDownloadQR = async (extension = 'png') => {
    if (!qrCodeRef.current) return;
    const name = `link-${selectedShortId || 'qr'}`;
    try {
      if (extension === 'png') {
        qrCodeRef.current.update(getQrOptions(qrValue, { width: 1024, height: 1024 }));
        await qrCodeRef.current.download({ name, extension: 'png' });
        qrCodeRef.current.update(getQrOptions(qrValue));
      } else {
        await qrCodeRef.current.download({ name, extension: 'svg' });
      }
      setQrDownloadFeedback(extension.toUpperCase() + ' downloaded');
      window.setTimeout(() => setQrDownloadFeedback(''), 1800);
    } catch {
      toast.error('Failed to download QR code');
      try { qrCodeRef.current.update(getQrOptions(qrValue)); } catch {}
    }
  };

  useEffect(() => {
    if (!qrModalOpen && !analyticsModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (analyticsModalOpen) closeAnalytics();
        else if (qrModalOpen) closeQR();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(() => {
      if (analyticsModalOpen) analyticsCloseRef.current?.focus?.();
      else if (qrModalOpen) qrCloseRef.current?.focus?.();
    });
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [qrModalOpen, analyticsModalOpen]);

  return (
    <div className="overflow-x-hidden">
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center animate fade-in">
        <p className="font-sans text-xs font-semibold text-gray-900 tracking-widest uppercase mb-6">
          Simplify your links
        </p>

      <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-[#FDFCF7] leading-tight mb-8">
        Transform Long Urls, into Tiny Links Instantly!
      </h1>

      <p className="font-sans text-gray-500 dark:text-slate-300 text-sm max-w-xl mx-auto mb-10 leading-relaxed">
          Shorten long links, track performance, and manage all your links in one place.
        </p>

        <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-xl shadow-sm overflow-hidden inline-block w-full max-w-lg mb-4">
          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-stretch">
              <div className="flex items-center flex-1 min-w-0">
                <div className="flex items-center pl-4 text-gray-400 dark:text-slate-500 shrink-0">
                  <Link2 className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  placeholder="https://example.com/some/long/url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); if (error) setError(null); }}
                  className="flex-1 min-w-0 px-4 py-4 min-h-[48px] text-sm text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder:text-slate-500 bg-transparent border-none outline-none focus:ring-0"
                  disabled={loading}
                  autoComplete="off"
                  aria-label="Destination URL"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-6 py-4 min-h-[48px] text-xs font-bold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors tracking-tighter uppercase whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed sm:shrink-0"
              >
                {loading ? 'Generating...' : 'Generate Link - its free'}
              </button>
            </div>
            <div className="px-4 py-3 border-t border-[#EBE9E0] dark:border-slate-700 bg-[#FBF9F4]/50 dark:bg-slate-900/30 space-y-2">
              <input
                type="text"
                placeholder="e.g., Portfolio, Campaign Link"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                aria-label="Link Title (optional)"
                className="w-full px-3 py-2.5 min-h-[44px] text-sm text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder:text-slate-400 bg-transparent border border-[#EBE9E0] dark:border-slate-700 rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-slate-50"
                disabled={loading}
              />
              <input
                type="text"
                placeholder={currentUser ? 'Custom Alias (Optional)' : 'Custom Alias (Sign in to use)'}
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                aria-label="Custom alias (optional, sign in required)"
                className="w-full px-3 py-2.5 min-h-[44px] text-sm text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder:text-slate-400 bg-transparent border border-[#EBE9E0] dark:border-slate-700 rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading || !currentUser}
                title={!currentUser ? 'Sign in to use custom aliases' : undefined}
              />
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="home-expires-at" className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Expiration Date {currentUser ? '(Optional)' : '(Sign in to use)'}
                  </label>
                  {currentUser && expiresAt && (
                    <button type="button" onClick={() => setExpiresAt('')} className="text-xs text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-50 underline underline-offset-2">Clear</button>
                  )}
                </div>
                <input
                  id="home-expires-at"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] text-sm text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder:text-slate-400 bg-transparent border border-[#EBE9E0] dark:border-slate-700 rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading || !currentUser}
                  title={!currentUser ? 'Sign in to set link expiration' : undefined}
                />
                {currentUser && <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">Leave blank to keep this link active indefinitely.</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="home-max-clicks" className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Max Clicks {currentUser ? '(Optional)' : '(Sign in to use)'}
                  </label>
                  {currentUser && maxClicks && (
                    <button type="button" onClick={() => setMaxClicks('')} className="text-xs text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-50 underline underline-offset-2">Clear</button>
                  )}
                </div>
                <input
                  id="home-max-clicks"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={maxClicks}
                  onChange={(e) => setMaxClicks(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] text-sm text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder:text-slate-400 bg-transparent border border-[#EBE9E0] dark:border-slate-700 rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading || !currentUser}
                  placeholder="e.g., 100"
                  title={!currentUser ? 'Sign in to set a max click limit' : undefined}
                />
                {currentUser && <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">Leave blank for unlimited clicks.</p>}
              </div>
              <div className="pt-1 border-t border-[#EBE9E0] dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowUtm((v) => !v)}
                  className="w-full flex items-center justify-between py-2 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50 rounded"
                  aria-expanded={showUtm}
                  aria-controls="home-utm-panel"
                >
                  <span>UTM Parameters (Optional)</span>
                  <span className="text-gray-500 dark:text-slate-400">{showUtm ? 'Hide' : 'Show'}</span>
                </button>
                {showUtm && (
                  <div id="home-utm-panel" className="space-y-2 pb-1">
                    <input
                      type="text"
                      placeholder="utm_source (e.g., linkedin, github, newsletter)"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      aria-label="UTM source"
                      className="w-full px-3 py-2.5 min-h-[44px] text-sm text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder:text-slate-400 bg-transparent border border-[#EBE9E0] dark:border-slate-700 rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-slate-50"
                      disabled={loading}
                    />
                    <input
                      type="text"
                      placeholder="utm_medium (e.g., social, post, email)"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      aria-label="UTM medium"
                      className="w-full px-3 py-2.5 min-h-[44px] text-sm text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder:text-slate-400 bg-transparent border border-[#EBE9E0] dark:border-slate-700 rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-slate-50"
                      disabled={loading}
                    />
                    <input
                      type="text"
                      placeholder="utm_campaign (e.g., portfolio_launch)"
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      aria-label="UTM campaign"
                      className="w-full px-3 py-2.5 min-h-[44px] text-sm text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder:text-slate-400 bg-transparent border border-[#EBE9E0] dark:border-slate-700 rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-slate-50"
                      disabled={loading}
                    />
                    {hasUtm && (
                      <div className="mt-2 px-3 py-2 rounded-lg bg-[#FDFCF7] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">Tagged destination preview</p>
                        <p className="text-xs text-gray-700 dark:text-slate-300 break-all" title={taggedDestination.url}>{taggedDestination.url || 'Enter a valid destination URL'}</p>
                        {taggedDestination.error && <p className="mt-1 text-xs text-[#dc2626] dark:text-red-400">{taggedDestination.error}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {!currentUser && (
                <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign in to use custom aliases, expiration, and link management.</span>
                </p>
              )}
            </div>
          </form>
        </div>

        {showGuestPrompt && !currentUser && (
          <div className="max-w-lg mx-auto mb-6 px-4 py-4 rounded-xl bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 text-left shadow-sm">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-50 mb-1">Want click analytics, custom aliases, and link management?</p>
            <p className="text-xs text-gray-600 dark:text-slate-400 mb-3">Sign in to save this link to your dashboard and unlock insights.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/login" className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] text-xs font-bold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors uppercase tracking-tighter">Sign in</Link>
              <Link to="/signup" className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] text-xs font-bold text-gray-900 dark:text-slate-50 bg-[#FDFCF7] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-lg hover:bg-[#EFEBE2] dark:hover:bg-slate-700 transition-colors uppercase tracking-tighter">Create account</Link>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-lg mx-auto px-4 py-3 rounded-lg bg-[#fef2f2] dark:bg-red-900/20 border border-[#fca5a5] dark:border-red-800 text-xs text-[#dc2626] dark:text-red-400 font-medium" role="alert">
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
          <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-[#EBE9E0] dark:border-slate-700">
                  <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Original URL</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Short Link</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase text-right">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {shortenedUrls.map((url) => {
                  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                  const shortUrl = `${apiBase}/${url.shortId}`;
                  return (
                    <tr key={url.shortId} className="border-b border-[#EBE9E0] dark:border-slate-700 hover:bg-[#FBF9F4] dark:hover:bg-slate-700/50">
                      <td className="px-4 sm:px-6 py-4 min-w-0">
                        {url.title && <span className="block text-sm font-semibold text-gray-900 dark:text-slate-50 truncate max-w-[14rem] sm:max-w-xs" title={url.title}>{url.title}</span>}
                        <span className="text-sm text-gray-700 dark:text-slate-300 truncate max-w-[14rem] sm:max-w-xs block" title={url.originalUrl}>{url.originalUrl}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-mono text-gray-900 dark:text-slate-50 truncate max-w-[10rem] sm:max-w-xs" title={shortUrl}>{shortUrl}</span>
                          <button
                            onClick={() => handleCopy(shortUrl, url.shortId)}
                            className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors rounded-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50"
                            aria-label={copiedId === url.shortId ? `Copied short link ${url.shortId}` : `Copy short link ${url.shortId}`}
                            title={copiedId === url.shortId ? 'Copied!' : 'Copy short link'}
                          >
                            {copiedId === url.shortId ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={(e) => openQR(url.originalUrl, url.shortId, e.currentTarget)}
                            className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors rounded-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50"
                            aria-label={`Show QR code for ${url.shortId}`}
                            title="Show QR code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50 rounded-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50" aria-label={`Open short link ${url.shortId}`}>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <button onClick={(e) => openAnalytics(url.shortId, e.currentTarget)} className="inline-flex items-center gap-2 ml-auto min-h-[44px] px-2 text-sm text-gray-900 dark:text-slate-50 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50" aria-label={`View analytics for ${url.shortId}`}>
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
          </div>
        </section>
      )}

      <Stats />
      <Features />
      <Testimonials />
      <FAQ />

      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeQR} />
          <div className="relative bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl max-w-sm w-full my-auto max-h-[calc(100vh-3rem)] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
            <button
              ref={qrCloseRef}
              onClick={closeQR}
              className="absolute top-3 right-3 p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50"
              aria-label="Close QR code dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 id="qr-modal-title" className="font-serif text-lg font-bold text-gray-900 dark:text-slate-50 mb-4 text-center">QR Code</h3>
            <div className="bg-[#FDFCF7] dark:bg-slate-900/50 p-4 rounded-xl border border-[#EBE9E0] dark:border-slate-700 mb-3 flex justify-center">
              <div ref={qrRef} />
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 text-center mb-4 break-all">
              Points to:{' '}
              <span className="block mt-1" title={qrValue}>
                {qrValue}
              </span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDownloadQR('png')}
                className="px-3 py-3 min-h-[44px] text-xs font-bold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F7F2] dark:focus-visible:ring-offset-slate-800"
              >
                Download PNG (HD)
              </button>
              <button
                onClick={() => handleDownloadQR('svg')}
                className="px-3 py-3 min-h-[44px] text-xs font-bold text-gray-900 dark:text-slate-50 bg-[#FDFCF7] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-lg hover:bg-[#EFEBE2] dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50"
              >
                Download SVG
              </button>
            </div>
            <div className="h-5 mt-2 text-center text-[11px] font-medium text-emerald-700 dark:text-emerald-400" aria-live="polite">{qrDownloadFeedback}</div>
            <button
              onClick={() => setIsCustomizing((prev) => !prev)}
              className="mt-3 w-full px-4 py-3 min-h-[44px] text-xs font-bold text-gray-900 dark:text-slate-50 bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-lg hover:bg-[#EFEBE2] dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50"
              aria-expanded={isCustomizing}
              aria-controls="qr-customization-panel"
            >
              <Sliders className="w-4 h-4" />
              {isCustomizing ? 'Hide Customization' : 'Customize QR'}
            </button>

            {isCustomizing && (
              <div id="qr-customization-panel" className="mt-4 pt-4 border-t border-[#EBE9E0] dark:border-slate-700 space-y-4 transition-all duration-300">
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

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-2">
                    Center Badge
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[
                      { value: 'none', label: 'None' },
                      { value: 'brand', label: 'L.ink Brand Mark' },
                      { value: 'initials', label: 'Custom Initials' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setQrBadgeMode(opt.value)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${qrBadgeMode === opt.value ? 'bg-gray-900 text-white border-gray-900 dark:bg-slate-50 dark:text-gray-900 dark:border-slate-50' : 'bg-[#FDFCF7] dark:bg-slate-900/50 text-gray-700 dark:text-slate-300 border-[#EBE9E0] dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {qrBadgeMode === 'initials' && (
                    <input
                      type="text"
                      value={qrBadgeText}
                      onChange={(e) => setQrBadgeText(e.target.value.slice(0, 3).toUpperCase())}
                      maxLength={3}
                      placeholder="e.g., AP"
                      aria-label="QR center badge initials"
                      className="w-full px-3 py-2 text-sm text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder:text-slate-400 bg-[#FDFCF7] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-slate-50"
                    />
                  )}
                  {qrHasBadge && <p className="mt-2 text-[11px] text-gray-500 dark:text-slate-400">High error correction (H) enabled for scannability.</p>}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleDownloadQR('png')}
                    className="px-3 py-2 text-xs font-bold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors"
                  >
                    Download PNG (HD)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeAnalytics} />
          <div className="relative bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl max-w-md w-full my-auto max-h-[calc(100vh-3rem)] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="analytics-modal-title">
            <button ref={analyticsCloseRef} onClick={closeAnalytics} className="absolute top-3 right-3 p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50" aria-label="Close analytics dialog">
              <X className="w-5 h-5" />
            </button>
            <h3 id="analytics-modal-title" className="font-serif text-lg font-bold text-gray-900 dark:text-slate-50 mb-4">Link Analytics</h3>
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
