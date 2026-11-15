export default function Testimonials() {
  const testimonials = [
    {
      name: 'Daniel Edwards',
      handle: '@daniel_ed',
      role: 'Product Manager',
      quote: 'You made it so simple, this new design with how to use it, is just great. I will choose you over any other shortener.',
    },
    {
      name: 'Leslie Alexander',
      handle: '@leslie_al',
      role: 'Marketing Lead',
      quote: 'Finally the best, better than all the other link shortening solutions I have tried before.',
    },
    {
      name: 'Jimmy Wilson',
      handle: '@jimmy_w',
      role: 'Founder',
      quote: 'This is a quality product, no doubt about it. Already integrated into our workflow.',
    },
    {
      name: 'Hilda Hanson',
      handle: '@hilda_h',
      role: 'Designer',
      quote: 'Firstly, I want to thank you guys for starting out the launch. I am so happy with the service.',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-[#EBE9E0] text-4xl font-serif font-bold">″</span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-[#FDFCF7] mb-4">
          Trusted by Thousands Worldwide
        </h2>
        <p className="font-sans text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
          "Using the L.ink shortener has completely transformed how I share links. The analytics and ease of use are unmatched."
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-[#FBF9F4] border border-[#EBE9E0] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full border border-[#EBE9E0] bg-[#EFEBE2] flex items-center justify-center text-[10px] font-bold text-gray-600">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="font-sans text-xs font-semibold text-gray-900 leading-tight">{t.name}</p>
                <p className="font-sans text-[10px] text-gray-400">{t.handle}</p>
              </div>
            </div>
            <p className="font-sans text-sm text-gray-600 leading-relaxed italic">
              {t.quote}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
