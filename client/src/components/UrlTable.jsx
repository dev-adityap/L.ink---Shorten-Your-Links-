export default function UrlTable({ urls }) {
  if (!urls || urls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500 text-sm">No shortened URLs yet.</p>
      </div>
    );
  }

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
          {urls.map((url) => (
            <tr key={url._id || url.shortId} className="link-row animate fade-in">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {url.originalUrl}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center text-sm font-mono text-gray-900 truncate max-w-xs">
                    {`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${url.shortId}`}
                  </span>
                  <button
                    className="copy-btn"
                    title="Copy short link"
                    aria-label="Copy short link"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${url.shortId}`}
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
                    {url.clicks}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {new Date(url.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
