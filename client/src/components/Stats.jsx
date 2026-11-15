export default function Stats() {
  const stats = [
    { value: '18K+', label: 'Total Users' },
    { value: '1M+', label: 'Links Created' },
    { value: '10M+', label: 'Redirect Links' },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
      <div className="flex justify-between items-baseline gap-8 flex-wrap">
        {stats.map((stat) => (
          <div key={stat.label} className="mb-6">
            <span className="font-serif text-6xl sm:text-7xl font-bold text-[#D9D6C6]">
              {stat.value}
            </span>
            <p className="font-sans text-xs font-medium text-gray-500 mt-2 tracking-wider uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
