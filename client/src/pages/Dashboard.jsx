import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link2, MousePointerClick, Trophy } from 'lucide-react';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/urls`);
        if (res.ok) {
          const data = await res.json();
          setLinks(data.data || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const topLink = links.length > 0
    ? links.reduce((prev, current) => (prev.clicks > current.clicks ? prev : current))
    : null;

  const chartData = links.slice(0, 10).map((link) => ({
    name: link.shortId || link.customAlias,
    clicks: link.clicks || 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF7] dark:bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
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
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-4xl font-bold text-gray-900 dark:text-[#FDFCF7] mb-2">
          Link Analytics Dashboard
        </h1>
        <p className="font-sans text-gray-600 dark:text-slate-300 mb-8">
          Overview of your shortened links and performance
        </p>

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
            <p className="text-3xl font-bold text-gray-900 dark:text-slate-50">{totalClicks}</p>
          </div>

          <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Top Performing Link
              </h3>
              <Trophy className="w-5 h-5 text-gray-900 dark:text-slate-50" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-slate-50 truncate">
              {topLink ? `/${topLink.shortId}` : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{topLink?.clicks || 0} clicks</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-50 mb-6">Click Volume by Link</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE9E0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
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
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EBE9E0] dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-50">All Links</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EBE9E0] dark:border-slate-700">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Short Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Original URL
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
                {links.map((link) => (
                  <tr key={link._id} className="border-b border-[#EBE9E0] dark:border-slate-700 hover:bg-[#FBF9F4] dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900 dark:text-slate-50">
                        /{link.shortId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-slate-300 truncate block max-w-xs">
                        {link.originalUrl}
                      </span>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
