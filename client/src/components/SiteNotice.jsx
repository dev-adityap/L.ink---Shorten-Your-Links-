import { useState, useEffect } from 'react';

const CONSENT_KEY = 'linkly-cookie-consent';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setShow(false);
  };

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-banner">
      <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8">
          <p className="text-sm text-gray-700 leading-relaxed">
            We use cookies to enhance your experience and analyze traffic.
            By clicking &ldquo;Accept,&rdquo; you consent to our use of cookies.
          </p>
        </div>
        <div className="md:col-span-4 flex flex-col sm:flex-row gap-3 justify-end">
          <button onClick={reject} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-transparent border border-[#EBE9E0] rounded-xl hover:bg-[#EFEBE2] transition-colors">
            Reject
          </button>
          <button onClick={accept} className="flex-1 px-4 py-2 text-sm font-bold text-gray-900 bg-[#FBF9F4] border border-[#EBE9E0] rounded-xl hover:bg-[#EFEBE2] transition-colors">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
