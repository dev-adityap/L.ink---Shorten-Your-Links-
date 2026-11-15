import { useState } from 'react';

const faqs = [
  {
    q: 'Is it free to use?',
    a: 'Yes, our basic URL shortening service is completely free. Premium features are available for advanced analytics.',
  },
  {
    q: 'Can I customize my short link?',
    a: 'Absolutely. You can create custom aliases and branded short links to match your brand identity.',
  },
  {
    q: 'How secure are my links?',
    a: 'All links are encrypted and monitored. We follow industry-standard security practices to protect your data.',
  },
  {
    q: 'Can I track link performance?',
    a: 'Yes. Our dashboard provides real-time click tracking, geographic data, and referrer insights for every link.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="lg:w-1/2">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-[#FDFCF7] mb-2">
            Got Questions?
          </h2>
          <p className="font-sans text-gray-500 dark:text-slate-300 text-sm mb-8">
            We&rsquo;ve Got Answers. Some frequently asked questions.
          </p>
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={faq.q}
                  className="border border-[#EBE9E0] dark:border-slate-700 rounded-xl overflow-hidden group"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-[#FBF9F4] dark:bg-slate-800 transition-colors"
                  >
                    <span className="font-sans text-sm font-medium text-gray-900 dark:text-slate-100">
                      {faq.q}
                    </span>
                    <span className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      <svg
                        className="w-full h-full text-gray-500 dark:text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 py-4 border-t border-[#EBE9E0] dark:border-slate-700 bg-[#EFEBE2] dark:bg-slate-900/50">
                      <p className="font-sans text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:w-1/2 hidden lg:block">
          {/* Illustration placeholder */}
          <div className="aspect-square bg-[#EFEBE2] border-2 border-dashed border-[#EBE9E0] rounded-2xl flex items-center justify-center">
            <span className="text-gray-400 text-sm font-medium">Illustration placeholder</span>
          </div>
        </div>
      </div>
    </section>
  );
}
