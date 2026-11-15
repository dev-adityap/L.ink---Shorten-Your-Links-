export default function FloatingContact() {
  return (
    <a
      href="mailto:hello@link.ink"
      className="fixed bottom-8 left-8 z-40 bg-gray-900 text-white p-3 rounded-xl shadow-lg hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-gray-900/50"
      aria-label="Contact us via email"
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </a>
  );
}
