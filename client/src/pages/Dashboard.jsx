import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link2, MousePointerClick, Trophy, Copy, Check, Trash2, Search, Download, Pencil, X, Power, CalendarClock, BarChart3, Smartphone, Monitor, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const getLinkStatus = (link) => {
  if (link.expiresAt && new Date() > new Date(link.expiresAt)) return 'Expired';
  return link.isActive === false ? 'Paused' : 'Active';
};

const statusStyles = {
  Active: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  Paused: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  Expired: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
};

const toDateTimeLocalValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const normalizeDevice = (entry = {}) => {
  if (entry.device === 'Mobile' || entry.device === 'Desktop') return entry.device;
  const ua = entry.userAgent || '';
  return /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
};

const normalizeReferrer = (entry = {}) => {
  const ref = (entry.referrer || '').trim();
  if (!ref) return 'Direct / None';
  return ref;
};

const getAnalyticsBreakdown = (analytics = []) => {
  const total = analytics.length;
  const deviceCounts = { Mobile: 0, Desktop: 0 };
  const refCounts = {};

  for (const entry of analytics) {
    const device = normalizeDevice(entry);
    deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    const ref = normalizeReferrer(entry);
    refCounts[ref] = (refCounts[ref] || 0) + 1;
  }

  const pct = (count) => (total ? Math.round((count / total) * 100) : 0);
  const devices = [
    { label: 'Mobile', count: deviceCounts.Mobile, percent: pct(deviceCounts.Mobile), icon: 'mobile' },
    { label: 'Desktop', count: deviceCounts.Desktop, percent: pct(deviceCounts.Desktop), icon: 'desktop' },
  ];

  const topReferrers = Object.entries(refCounts)
    .map(([label, count]) => ({ label, count, percent: pct(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { total, devices, topReferrers };
};

export default function Dashboard({ siteSearchQuery = '', onSiteSearchQueryChange }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editAlias, setEditAlias] = useState('');
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [insightLinkId, setInsightLinkId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const editTriggerRef = useRef(null);
  const editCloseRef = useRef(null);
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const searchQuery = siteSearchQuery;
  const setSearchQuery = (value) => onSiteSearchQueryChange?.(value);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        if (!currentUser) return;
        const token = await currentUser.getIdToken();
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/urls`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setLinks(data.data || []);
        } else {
          setLinks([]);
        }
      } catch {
        setLinks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, [currentUser]);

  useEffect(() => {
    const incoming = location.state?.linkSearch;
    if (typeof incoming === 'string') {
      onSiteSearchQueryChange?.(incoming);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, onSiteSearchQueryChange]);

  const handleCopy = async (shortId) => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const shortUrl = `${apiBase}/${shortId}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(shortId);
      toast.success('Link copied to clipboard!');
      window.setTimeout(() => setCopiedId((prev) => (prev === shortId ? null : prev)), 2000);
    } catch {
      toast.error('Failed to copy link. Please copy it manually.');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this link?');
    if (!confirmed) return;

    try {
      if (!currentUser) {
        toast.error('You must be logged in to delete links');
        return;
      }

      const token = await currentUser.getIdToken();
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/urls/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete link');
      }

      setLinks((prev) => prev.filter((link) => link._id !== id));
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      toast.success('Link deleted!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete link');
    }
  };

  const handleEditOpen = (link, triggerEl) => {
    editTriggerRef.current = triggerEl || document.activeElement;
    setEditingLink(link);
    setEditOriginalUrl(link.originalUrl || '');
    setEditTitle(link.title || '');
    setEditAlias(link.customAlias || link.shortId || '');
    setEditExpiresAt(toDateTimeLocalValue(link.expiresAt));
  };

  const handleEditClose = () => {
    if (editSaving) return;
    setEditingLink(null);
    setEditOriginalUrl('');
    setEditTitle('');
    setEditAlias('');
    setEditExpiresAt('');
    requestAnimationFrame(() => editTriggerRef.current?.focus?.());
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingLink) return;

    const trimmedUrl = editOriginalUrl.trim();
    const trimmedAlias = editAlias.trim();

    if (!trimmedUrl) {
      toast.error('Original URL is required');
      return;
    }

    try {
      const parsed = new URL(trimmedUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        toast.error('Please enter a valid URL (include http:// or https://)');
        return;
      }
    } catch {
      toast.error('Please enter a valid URL (include http:// or https://)');
      return;
    }

    try {
      if (!currentUser) {
        toast.error('You must be logged in to edit links');
        return;
      }

      setEditSaving(true);
      const token = await currentUser.getIdToken();
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/urls/${editingLink._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalUrl: trimmedUrl,
          title: editTitle.trim(),
          customAlias: trimmedAlias,
          expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(data.message || 'Custom alias is already taken');
        }
        throw new Error(data.message || 'Failed to update link');
      }

      const updated = data.data || data;
      setLinks((prev) => prev.map((link) => (link._id === updated._id ? updated : link)));
      toast.success('Link updated!');
      setEditingLink(null);
      setEditOriginalUrl('');
      setEditTitle('');
      setEditAlias('');
      setEditExpiresAt('');
    } catch (error) {
      toast.error(error.message || 'Failed to update link');
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleActive = async (link) => {
    try {
      if (!currentUser) {
        toast.error('You must be logged in to update links');
        return;
      }

      setTogglingId(link._id);
      const token = await currentUser.getIdToken();
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const nextIsActive = link.isActive === false;

      const res = await fetch(`${apiBase}/api/urls/${link._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: nextIsActive }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update link status');
      }

      const updated = data.data || data;
      setLinks((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      toast.success(nextIsActive ? 'Link activated!' : 'Link paused!');
    } catch (error) {
      toast.error(error.message || 'Failed to update link status');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredUrls = links.filter((link) => {
    const query = searchQuery.toLowerCase();
    return (
      (link.originalUrl || '').toLowerCase().includes(query) ||
      (link.title || '').toLowerCase().includes(query) ||
      (link.shortId || '').toLowerCase().includes(query) ||
      (link.customAlias || '').toLowerCase().includes(query)
    );
  });

  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const topLink = links.length > 0
    ? [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0]
    : null;

  const insightLink = insightLinkId ? links.find((l) => l._id === insightLinkId) || null : null;
  const insightSourceLinks = insightLink ? [insightLink] : filteredUrls;
  const insightAnalytics = insightSourceLinks.flatMap((link) => (Array.isArray(link.analytics) ? link.analytics : []));
  const insightBreakdown = getAnalyticsBreakdown(insightAnalytics);
  const insightTitle = insightLink
    ? `Insights for ${insightLink.title ? `"${insightLink.title}"` : `/${insightLink.shortId}`}`
    : 'Global Click Insights';
  const insightSubtitle = insightLink
    ? 'Device and referrer breakdown for the selected link'
    : 'Device and referrer breakdown across filtered links';

  const safeChartData = Array.isArray(filteredUrls) ? filteredUrls : [];
  const chartData = [...safeChartData]
    .sort((a, b) => (Number(b.clicks) || 0) - (Number(a.clicks) || 0))
    .slice(0, 10)
    .map((link) => ({
      name: link.customAlias || link.shortId || 'link',
      clicks: Number(link.clicks) || 0,
    }));

  const totalClicksSafe = Number.isFinite(totalClicks) ? totalClicks : 0;
  const topLinkClicks = Number(topLink?.clicks) || 0;

  const filteredIds = filteredUrls.map((link) => link._id);
  const allFilteredSelected = filteredUrls.length > 0 && filteredIds.every((id) => selectedIds.includes(id));
  const someFilteredSelected = filteredIds.some((id) => selectedIds.includes(id)) && !allFilteredSelected;

  // Prune selections that no longer exist in current links
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => links.some((l) => l._id === id)));
  }, [links]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]));
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected link${selectedIds.length > 1 ? 's' : ''}?`);
    if (!confirmed) return;

    try {
      if (!currentUser) {
        toast.error('You must be logged in to delete links');
        return;
      }

      setBulkDeleting(true);
      const token = await currentUser.getIdToken();
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/urls/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete selected links');
      }

      // Only remove ids we actually requested (server scopes by owner); clear selection of processed ids
      const processedIds = new Set(selectedIds);
      setLinks((prev) => prev.filter((link) => !processedIds.has(link._id)));
      setSelectedIds([]);
      const deleted = data.deletedCount ?? 0;
      toast.success(`${deleted} link${deleted === 1 ? '' : 's'} deleted`);
    } catch (error) {
      toast.error(error.message || 'Failed to delete selected links');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExportCsv = () => {
    if (filteredUrls.length === 0) {
      toast.error('No links to export');
      return;
    }

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const headers = ['Title', 'Original URL', 'Short Alias', 'Short URL', 'Clicks', 'Status', 'Expires At', 'Created At'];

    const escapeCsv = (value) => {
      const str = value == null ? '' : String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredUrls.map((link) => {
      const shortAlias = link.customAlias || link.shortId || '';
      const shortUrl = `${apiBase}/${link.shortId}`;
      const createdAt = link.createdAt ? new Date(link.createdAt).toISOString() : '';
      const expiresAt = link.expiresAt ? new Date(link.expiresAt).toISOString() : '';
      const status = getLinkStatus(link);
      return [
        link.title || '',
        link.originalUrl || '',
        shortAlias,
        shortUrl,
        Number(link.clicks) || 0,
        status,
        expiresAt,
        createdAt,
      ].map(escapeCsv);
    });

    const csvContent = [headers.map(escapeCsv), ...rows].map((row) => row.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'l-ink-analytics.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV export started');
  };

  useEffect(() => {
    if (!editingLink) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') handleEditClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(() => editCloseRef.current?.focus?.());
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKeyDown); };
  }, [editingLink, editSaving]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF7] dark:bg-slate-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="skeleton h-8 w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-slate-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl font-bold text-gray-900 dark:text-[#FDFCF7] mb-2">
              Link Analytics Dashboard
            </h1>
            <p className="font-sans text-gray-600 dark:text-slate-300">
              Overview of your shortened links and performance
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredUrls.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-semibold bg-[#F8F7F2] border border-[#EBE9E0] text-gray-900 rounded-lg hover:bg-[#EFEBE2] transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Total Links
              </h3>
              <Link2 className="w-5 h-5 text-gray-900 dark:text-slate-50" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-slate-50">{totalLinks}</p>
          </div>

          <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Total Global Clicks
              </h3>
              <MousePointerClick className="w-5 h-5 text-gray-900 dark:text-slate-50" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-slate-50">{totalClicksSafe}</p>
          </div>

          <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Top Performing Link
              </h3>
              <Trophy className="w-5 h-5 text-gray-900 dark:text-slate-50" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-slate-50 truncate">
              {topLink ? (topLink.title || `/${topLink.shortId}`) : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{topLinkClicks} clicks</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-50 mb-6">Click Volume by Link</h2>
          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBE9E0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F8F7F2',
                      border: '1px solid #EBE9E0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="clicks" fill="#111111" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-slate-400 border border-dashed border-[#EBE9E0] dark:border-slate-700 rounded-lg">
                {searchQuery ? 'No matching links to chart.' : 'No click data yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Click Insights */}
        <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-gray-900 dark:text-slate-50" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-50">{insightTitle}</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400">{insightSubtitle}</p>
            </div>
            {insightLink && (
              <button
                type="button"
                onClick={() => setInsightLinkId(null)}
                className="inline-flex items-center justify-center px-3 py-2 text-sm font-semibold text-gray-900 dark:text-slate-50 bg-[#FDFCF7] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-lg hover:bg-[#EFEBE2] dark:hover:bg-slate-700 transition-colors"
              >
                Show Global
              </button>
            )}
          </div>

          {insightBreakdown.total === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400">No analytics data yet for this selection.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#FDFCF7] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Devices</h3>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {insightBreakdown.devices.map((d) => (
                    <span
                      key={d.label}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#EBE9E0] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-800 text-sm font-semibold text-gray-900 dark:text-slate-50"
                    >
                      {d.label === 'Mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                      {d.label} {d.percent}%
                    </span>
                  ))}
                </div>
                <div className="space-y-3">
                  {insightBreakdown.devices.map((d) => (
                    <div key={`bar-${d.label}`}>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                        <span>{d.label}</span>
                        <span>{d.count} click{d.count === 1 ? '' : 's'} • {d.percent}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#EBE9E0] dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.label === 'Mobile' ? 'bg-gray-900 dark:bg-slate-50' : 'bg-gray-500 dark:bg-slate-400'}`}
                          style={{ width: `${d.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#FDFCF7] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Top Referrers</h3>
                <div className="space-y-2">
                  {insightBreakdown.topReferrers.length > 0 ? (
                    insightBreakdown.topReferrers.map((ref) => (
                      <div
                        key={ref.label}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-[#EBE9E0] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-800"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Globe className="w-4 h-4 text-gray-500 dark:text-slate-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900 dark:text-slate-50 truncate" title={ref.label}>
                            {ref.label}
                          </span>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EBE9E0] text-gray-900 dark:bg-slate-700 dark:text-slate-50 whitespace-nowrap">
                          {ref.percent}% ({ref.count})
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-slate-400">No referrer data yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="mb-4 bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-50">
              {selectedIds.length} link{selectedIds.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearSelection}
                disabled={bulkDeleting}
                className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-slate-50 bg-[#FDFCF7] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-lg hover:bg-[#EFEBE2] dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EBE9E0] dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-50">All Links</h2>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someFilteredSelected;
                  }}
                  onChange={toggleSelectAllFiltered}
                  disabled={filteredUrls.length === 0}
                  aria-label="Select all filtered links"
                  className="h-4 w-4 rounded border-[#EBE9E0] dark:border-slate-600 text-gray-900 dark:text-slate-50 focus:ring-slate-400 dark:focus:ring-slate-500 bg-[#FDFCF7] dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50"
                />
                Select All (filtered)
              </label>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setSearchQuery('');
                  }
                }}
                placeholder="Search links..."
                aria-label="Search links by title, URL, or alias"
                className="w-full pl-10 pr-10 py-2.5 min-h-[44px] text-sm bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-50 placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 transition-shadow"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EBE9E0] dark:border-slate-700">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Short Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Original URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Clicks
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUrls.length > 0 ? (
                  filteredUrls.map((link) => {
                    const status = getLinkStatus(link);
                    const isToggling = togglingId === link._id;
                    const isActive = link.isActive !== false;
                    const isSelected = selectedIds.includes(link._id);

                    return (
                      <tr key={link._id} className="border-b border-[#EBE9E0] dark:border-slate-700 hover:bg-[#FBF9F4] dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(link._id)}
                            aria-label={`Select link ${link.title || `/${link.shortId}`}`}
                            className="h-5 w-5 rounded border-[#EBE9E0] dark:border-slate-600 text-gray-900 dark:text-slate-50 focus:ring-slate-400 dark:focus:ring-slate-500 bg-[#FDFCF7] dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50"
                          />
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                            <span className="font-mono text-sm text-gray-900 dark:text-slate-50 truncate max-w-[8rem] sm:max-w-none">
                              /{link.shortId}
                            </span>
                            <button
                              onClick={() => handleCopy(link.shortId)}
                              className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F7F2] dark:focus-visible:ring-offset-slate-800"
                              aria-label={copiedId === link.shortId ? `Copied short link /${link.shortId}` : `Copy short link /${link.shortId}`}
                              title={copiedId === link.shortId ? 'Copied!' : 'Copy short link'}
                            >
                              {copiedId === link.shortId ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setInsightLinkId((prev) => (prev === link._id ? null : link._id))}
                              className={`p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center transition-colors rounded-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F7F2] dark:focus-visible:ring-offset-slate-800 ${insightLinkId === link._id ? 'text-gray-900 dark:text-slate-50 bg-[#EFEBE2] dark:bg-slate-700' : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'}`}
                              aria-label={`View insights for ${link.title || `/${link.shortId}`}`}
                              aria-pressed={insightLinkId === link._id}
                              title="View insights"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleEditOpen(link, e.currentTarget)}
                              className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F7F2] dark:focus-visible:ring-offset-slate-800"
                              aria-label={`Edit link ${link.title || `/${link.shortId}`}`}
                              title="Edit link"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(link._id)}
                              className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-500 transition-colors duration-200 rounded-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F7F2] dark:focus-visible:ring-offset-slate-800"
                              aria-label={`Delete link ${link.title || `/${link.shortId}`}`}
                              title="Delete link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 min-w-0">
                          {link.title ? (
                            <span className="block text-sm font-semibold text-gray-900 dark:text-slate-50 truncate max-w-[12rem] sm:max-w-xs" title={link.title}>
                              {link.title}
                            </span>
                          ) : (
                            <span className="block text-sm font-semibold text-gray-900 dark:text-slate-50 truncate max-w-[12rem] sm:max-w-xs" title={`/${link.shortId}`}>
                              /{link.shortId}
                            </span>
                          )}
                          <span className="text-sm text-gray-600 dark:text-slate-300 truncate block max-w-[12rem] sm:max-w-xs" title={link.originalUrl}>
                            {link.originalUrl}
                          </span>
                          {link.expiresAt && getLinkStatus(link) !== 'Expired' && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                              <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Expires {new Date(link.expiresAt).toLocaleString()}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-full border w-fit ${statusStyles[status]}`}>
                              {status}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(link)}
                              disabled={isToggling}
                              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F7F2] dark:focus-visible:ring-offset-slate-800 ${
                                isActive
                                  ? 'bg-[#F8F7F2] text-gray-900 border-[#EBE9E0] hover:bg-[#EFEBE2] dark:bg-slate-800 dark:text-slate-50 dark:border-slate-700 dark:hover:bg-slate-700'
                                  : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800 dark:bg-slate-50 dark:text-gray-900 dark:border-slate-50 dark:hover:bg-slate-200'
                              }`}
                              aria-label={isActive ? `Pause link ${link.title || `/${link.shortId}`}` : `Activate link ${link.title || `/${link.shortId}`}`}
                              aria-pressed={!isActive}
                              title={isActive ? 'Pause link' : 'Activate link'}
                            >
                              <Power className="w-3.5 h-3.5" />
                              {isToggling ? 'Saving...' : isActive ? 'Pause' : 'Activate'}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-slate-300">
                            {new Date(link.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900 dark:text-slate-50">
                            {link.clicks || 0}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : links.length > 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-gray-700 dark:text-slate-300 font-medium mb-2">No links match your search.</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Try a different keyword or clear the filter.</p>
                      <button type="button" onClick={() => setSearchQuery('')} className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] text-sm font-semibold bg-gray-900 dark:bg-slate-50 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors">Clear search</button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-gray-700 dark:text-slate-300 font-medium mb-2">No links yet.</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Create your first short link to start tracking clicks.</p>
                      <button type="button" onClick={() => navigate('/')} className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] text-sm font-semibold bg-gray-900 dark:bg-slate-50 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors">Create a link</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleEditClose} />
          <div className="relative w-full max-w-lg bg-[#FDFCF7] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl my-auto max-h-[calc(100vh-3rem)] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="edit-link-title">
            <button
              ref={editCloseRef}
              type="button"
              onClick={handleEditClose}
              className="absolute top-3 right-3 p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50"
              aria-label="Close edit dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 id="edit-link-title" className="font-serif text-xl font-bold text-gray-900 dark:text-slate-50 mb-2">
              Edit Link
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
              Update the destination URL, custom alias, or expiration for this link.
            </p>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label htmlFor="edit-original-url" className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Destination URL
                </label>
                <input
                  id="edit-original-url"
                  type="url"
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm text-gray-900 dark:text-slate-100 bg-[#F8F7F2] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-50 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                  placeholder="https://example.com/page"
                />
              </div>

              <div>
                <label htmlFor="edit-title" className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Link Title (optional)
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-3 text-sm text-gray-900 dark:text-slate-100 bg-[#F8F7F2] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-50 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                  placeholder="e.g., Portfolio, Campaign Link"
                />
              </div>

              <div>
                <label htmlFor="edit-alias" className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Custom Alias
                </label>
                <input
                  id="edit-alias"
                  type="text"
                  value={editAlias}
                  onChange={(e) => setEditAlias(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-gray-900 dark:text-slate-100 bg-[#F8F7F2] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-50 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                  placeholder="custom-alias"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                  Current short link: /{editingLink.shortId}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="edit-expires-at" className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    Expiration Date (optional)
                  </label>
                  {editExpiresAt && (
                    <button type="button" onClick={() => setEditExpiresAt('')} className="text-xs text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-50 underline underline-offset-2">Clear</button>
                  )}
                </div>
                <input
                  id="edit-expires-at"
                  type="datetime-local"
                  value={editExpiresAt}
                  onChange={(e) => setEditExpiresAt(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-gray-900 dark:text-slate-100 bg-[#F8F7F2] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-50"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                  Leave empty to keep this link active indefinitely.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleEditClose}
                  disabled={editSaving}
                  className="px-4 py-2.5 min-h-[44px] text-sm font-semibold text-gray-900 dark:text-slate-50 bg-[#F8F7F2] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 rounded-lg hover:bg-[#EFEBE2] dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-4 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-slate-50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDFCF7] dark:focus-visible:ring-offset-slate-800"
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
