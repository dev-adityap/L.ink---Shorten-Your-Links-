import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import SiteNotice from './components/SiteNotice';
import FloatingContact from './components/FloatingContact';
import PrintStyles from './components/PrintStyles';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import QrGenerator from './pages/QrGenerator';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const GUEST_LINK_IDS_KEY = 'link_guest_short_ids';

export default function App() {
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [siteSearchQuery, setSiteSearchQuery] = useState('');
  const [claimVersion, setClaimVersion] = useState(0);
  const { currentUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem(GUEST_LINK_IDS_KEY);
        const shortIds = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(shortIds) || shortIds.length === 0) return;
        const token = await currentUser.getIdToken();
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/urls/claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ shortIds }),
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        localStorage.removeItem(GUEST_LINK_IDS_KEY);
        if ((data.claimedCount || 0) > 0) {
          toast.success(`${data.claimedCount} guest link${data.claimedCount === 1 ? '' : 's'} added to your dashboard`);
        }
        setClaimVersion((v) => v + 1);
      } catch {
        // keep guest ids for a later retry
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser]);

  const handleShortened = (newUrl) => {
    setShortenedUrls((prev) => [newUrl, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-slate-900 text-gray-900 dark:text-slate-50 overflow-x-hidden transition-colors">
      <a href="#main-content" id="skip-to-content">
        Skip to content
      </a>

      <Navbar siteSearchQuery={siteSearchQuery} onSiteSearchQueryChange={setSiteSearchQuery} />
      <ScrollProgress />
      <SiteNotice />

      <main id="main-content" className="min-w-0">
        <Routes>
          <Route path="/" element={<Home shortenedUrls={shortenedUrls} onShortened={handleShortened} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard key={claimVersion} siteSearchQuery={siteSearchQuery} onSiteSearchQueryChange={setSiteSearchQuery} />
              </ProtectedRoute>
            }
          />
          <Route path="/qr-generator" element={<QrGenerator />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <BackToTop />
      <FloatingContact />
      <PrintStyles />
      <Toaster position="bottom-right" />
    </div>
  );
}

