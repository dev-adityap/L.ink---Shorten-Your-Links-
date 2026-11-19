import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
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

export default function App() {
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [siteSearchQuery, setSiteSearchQuery] = useState('');

  const handleShortened = (newUrl) => {
    setShortenedUrls((prev) => [newUrl, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-slate-900 text-gray-900 dark:text-slate-50">
      <a href="#main-content" id="skip-to-content">
        Skip to content
      </a>

      <Navbar siteSearchQuery={siteSearchQuery} onSiteSearchQueryChange={setSiteSearchQuery} />
      <ScrollProgress />
      <SiteNotice />

      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home shortenedUrls={shortenedUrls} onShortened={handleShortened} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard siteSearchQuery={siteSearchQuery} onSiteSearchQueryChange={setSiteSearchQuery} />
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

