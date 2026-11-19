import { Link, BarChart3, Sliders, QrCode } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const icons = {
  'Seamless URL Shortening': Link,
  'Advanced Link Analytics': BarChart3,
  'Customizable Links': Sliders,
  'Generate QRs': QrCode,
};

export default function Features() {
  const features = [
    {
      title: 'Seamless URL Shortening',
      desc: 'Transform long links into short, trackable URLs in seconds. Simple, fast, and reliable link generation.',
    },
    {
      title: 'Advanced Link Analytics',
      desc: 'Get detailed insights with click tracking, geographic data, and referrer analytics to optimize your links.',
    },
    {
      title: 'Customizable Links',
      desc: 'Create branded, custom short links that match your identity and improve click-through rates effortlessly.',
    },
    {
      title: 'Generate QRs',
      desc: 'Instantly generate QR codes for any shortened link. Perfect for print, events, and offline marketing campaigns.',
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cardClassName =
    'bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-2xl p-8 hover:border-[#D9D6C6] dark:hover:border-slate-500 group cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg';

  return (
    <section id="features" className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-50 mb-4">
          Why choose us
        </h2>
        <p className="font-sans text-gray-600 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          We&rsquo;re not just another URL shortener. Our platform is built with a focus on reliability, user experience,
          and detailed analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature) => {
          const Icon = icons[feature.title];
          const content = (
            <>
              <div className="w-12 h-12 rounded-lg border border-[#EBE9E0] dark:border-slate-700 bg-[#FBF9F4] dark:bg-slate-900/50 flex items-center justify-center mb-6 group-hover:border-gray-900 dark:group-hover:border-slate-50 transition-colors">
                <Icon className="w-6 h-6 text-gray-900 dark:text-slate-50" />
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-slate-50 mb-3">
                {feature.title}
              </h3>
              <p className="font-sans text-gray-600 dark:text-slate-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </>
          );

          if (feature.title === 'Generate QRs') {
            return (
              <RouterLink key={feature.title} to="/qr-generator" className={cardClassName}>
                {content}
              </RouterLink>
            );
          }

          if (feature.title === 'Customizable Links') {
            return (
              <RouterLink key={feature.title} to="/" onClick={scrollToTop} className={cardClassName}>
                {content}
              </RouterLink>
            );
          }

          if (feature.title === 'Advanced Link Analytics') {
            return (
              <RouterLink key={feature.title} to="/dashboard" className={cardClassName}>
                {content}
              </RouterLink>
            );
          }

          return (
            <div key={feature.title} className={cardClassName}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}

