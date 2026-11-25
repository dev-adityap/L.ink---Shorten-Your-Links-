import CopyButton from './CopyButton';

export default function ResultsTable({ urls }) {
  if (!urls || urls.length === 0) {
    return null;
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 animate slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-gray-900">Your Links</h2>
      </div>

      <div className="bg-[#FBF9F4] border border-[#EBE9E0] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#EBE9E0]">
              <th className="px-6 py-4 text-xs font-sans font-semibold text-gray-500 uppercase tracking-wider">
                Original URL
              </th>
              <th className="px-6 py-4 text-xs font-sans font-semibold text-gray-500 uppercase tracking-wider">
                Short Link
              </th>
              <th className="px-6 py-4 text-xs font-sans font-semibold text-gray-500 uppercase tracking-wider text-right">
                Clicks
              </th>
            </tr>
          </thead>
          <tbody>
            {urls.map((url) => {
              const shortUrl = `${apiBase}/${url.shortId}`;
              return (
                <tr
                  key={url._id || url.shortId}
                  className="border-b border-[#EBE9E0] hover:bg-[#EFEBE2] transition-colors"
                >
                  <td className="px-6 py-4">
                    {url.title && <span className="block text-sm font-semibold text-gray-900 truncate max-w-xs" title={url.title}>{url.title}</span>}
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-sm text-gray-700 truncate max-w-xs" title={url.originalUrl}>
                        {url.originalUrl}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-sm font-mono text-gray-900 truncate max-w-xs">
                        {shortUrl}
                      </span>
                      <CopyButton text={shortUrl} />
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs font-medium text-gray-600 hover:text-gray-900 underline underline-offset-4 transition-colors"
                      >
                        Open
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-sans text-sm font-semibold text-gray-900">
                      {Number(url.clicks) || 0}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
