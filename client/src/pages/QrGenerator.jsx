import { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const qrCode = new QRCodeStyling({
  width: 250,
  height: 250,
  type: 'svg',
  data: '',
  image: '',
  dotsOptions: {
    color: '#000000',
    type: 'square',
  },
  backgroundOptions: {
    color: '#FFFFFF',
  },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 4,
  },
});

export default function QrGenerator() {
  const [url, setUrl] = useState('');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [qrStyle, setQrStyle] = useState('square');
  const [logoUrl, setLogoUrl] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    qrCode.update({
      data: url || 'https://example.com',
      image: logoUrl || '',
      dotsOptions: {
        color: fgColor,
        type: qrStyle === 'rounded' ? 'rounded' : qrStyle === 'dots' ? 'dots' : 'square',
      },
      backgroundOptions: {
        color: bgColor,
      },
    });
  }, [url, fgColor, bgColor, qrStyle, logoUrl]);

  useEffect(() => {
    qrCode.append(ref.current);
  }, []);

  const downloadQR = () => {
    qrCode.download({ name: 'qr-code', extension: 'png' });
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-slate-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto min-w-0">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 min-h-[44px] text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-sm h-fit min-w-0">
            <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-slate-50 mb-2">
              QR Code Builder
            </h1>
            <p className="font-sans text-gray-600 dark:text-slate-400 text-sm mb-6">
              Customize your QR code with colors, shapes, and logos
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-900 dark:text-slate-50 uppercase tracking-wider mb-2">
                  URL
                </label>
                <input
                  type="url"
                  placeholder="Enter any URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 min-h-[44px] text-sm text-gray-900 dark:text-slate-50 bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 dark:text-slate-50 uppercase tracking-wider mb-2">
                    Foreground
                  </label>
                  <div className="flex items-center gap-2 bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-xl p-2 min-h-[44px]">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs text-gray-600 dark:text-slate-400 font-mono truncate">{fgColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 dark:text-slate-50 uppercase tracking-wider mb-2">
                    Background
                  </label>
                  <div className="flex items-center gap-2 bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-xl p-2 min-h-[44px]">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs text-gray-600 dark:text-slate-400 font-mono truncate">{bgColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-900 dark:text-slate-50 uppercase tracking-wider mb-2">
                  QR Shape
                </label>
                <select
                  value={qrStyle}
                  onChange={(e) => setQrStyle(e.target.value)}
                  className="w-full px-4 py-3 min-h-[44px] text-sm text-gray-900 dark:text-slate-50 bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-50"
                >
                  <option value="square">Square</option>
                  <option value="rounded">Rounded</option>
                  <option value="dots">Dots</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-900 dark:text-slate-50 uppercase tracking-wider mb-2">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-4 py-3 min-h-[44px] text-sm text-gray-900 dark:text-slate-50 bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-24 h-fit min-w-0">
            <div className="bg-[#FDFCF7] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
              <h2 className="font-serif text-lg font-bold text-gray-900 dark:text-slate-50 mb-6">
                Live Preview
              </h2>
              <div className="bg-[#F8F7F2] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-xl p-6 sm:p-8 mb-6 flex justify-center min-h-[300px] items-center overflow-x-auto">
                <div ref={ref} />
              </div>
              <button
                onClick={downloadQR}
                disabled={!url.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] text-xs font-bold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors tracking-tighter uppercase disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Download QR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
