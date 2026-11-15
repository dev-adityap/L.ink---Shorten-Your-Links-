import LastUpdated from './LastUpdated';

export default function Footer() {
  return (
    <div className="bg-[#1A1A18] border-t border-[#2A2A24]">
      {/* CTA Box */}
      <div className="bg-[#1A1A18] border border-[#2A2A24] rounded-2xl p-8 md:p-12 mx-4 sm:mx-10 lg:mx-20 mt-20 mb-16 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to simplify Your Links?
        </h2>
        <p className="font-sans text-gray-400 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
          Join thousands of users who trust L.ink to simplify their links &amp; amplify their reach.
        </p>
        <a
          href="#signup"
          className="px-6 py-3 text-xs font-bold text-gray-900 bg-[#FBF9F4] hover:bg-[#EFEBE2] transition-colors tracking-tighter uppercase"
        >
          Get Started - its free
        </a>
      </div>

      {/* Standard Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { window.location.href = '#'; }}>
            <span className="font-serif font-bold text-xl text-white tracking-tight">L.</span>
            <span className="font-sans font-bold text-xs text-gray-400 tracking-widest uppercase">ink</span>
            <span className="text-xs text-gray-500">™</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500 font-sans">
            <a href="#" className="hover:text-white transition-colors">Short Privacy</a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="mailto:hello@link.ink"
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="Email us"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
            <a
              href="tel:+1234567890"
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="Call us"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 011.17.563l1.421 1.421a1 1 0 01.563 1.17l2.307 2.307a1 1 0 01.17 1.563l1.421 1.421a1 1 0 01-.563 1.17l-1.421 1.421c-.343.343-.73.563-1.17.563H18.28a2 2 0 01-1.17.563l-2.307 2.307a2 2 0 01-1.563 1.17l-1.421 1.421a2 2 0 01-1.17.563H13.48a2 2 0 01-.563 1.17l-2.307 2.307a2 2 0 01-1.563 1.17l-1.421 1.421c-.343.343-.73.563-1.17.563H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between gap-4 text-[10px] text-gray-500 font-sans">
          <p className="whitespace-nowrap">© 2025 L.ink. Short Privacy.</p>
          <div className="flex items-center gap-2">
            <a href="#" className="hover:text-gray-300 transition-colors">Terms and Conditions</a>
            <span className="text-gray-700">|</span>
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <span className="text-gray-700">|</span>
            <a href="#" className="hover:text-gray-300 transition-colors">All right reserved</a>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <LastUpdated />
        </div>
      </div>
    </div>
  );
}
